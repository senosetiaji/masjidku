import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

// Reuse a single Prisma instance during dev hot-reload
const globalForPrisma = globalThis;
let prisma = globalForPrisma.prisma;
if (!prisma) {
	prisma = new PrismaClient();
	if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
}

const SECRET = process.env.APP_SECRET || "dev-secret";
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const verifyToken = (token) => {
	if (!token) return null;
	const [encoded, signature] = token.split(".");
	if (!encoded || !signature) return null;
	const expected = crypto.createHmac("sha256", SECRET).update(encoded).digest("hex");
	if (expected !== signature) return null;
	const json = Buffer.from(encoded, "base64url").toString("utf8");
	try {
		return JSON.parse(json);
	} catch (e) {
		return null;
	}
};

const parsePositiveInt = (val, fallback = null) => {
	const n = parseInt(val, 10);
	return Number.isFinite(n) && n > 0 ? n : fallback;
};

const normalizeQueryValue = (val) => (Array.isArray(val) ? val[0] : val);

const toInt = (val) => {
	const n = Number(val);
	return Number.isFinite(n) ? n : 0;
};

export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		// Auth via HMAC session cookie
		const cookieHeader = req.headers.cookie || "";
		const sessionCookie = cookieHeader.split(";").find((c) => c.trim().startsWith("session="));
		const token = sessionCookie ? sessionCookie.trim().replace("session=", "") : null;
		const session = verifyToken(token);
		if (!session?.id) {
			return res.status(401).json({ message: "unauthorized" });
		}

		const userExists = await prisma.user.findUnique({ where: { id: String(session.id) }, select: { id: true } });
		if (!userExists) {
			return res.status(401).json({ message: "invalid_session_user" });
		}

		const rawYear = normalizeQueryValue(req.query.year ?? req.query.tahun);
		const rawCustomer = normalizeQueryValue(
			req.query.customer_id ?? req.query.customerId ?? req.query.pelanggan_id ?? req.query.pelangganId
		);

		const year = parsePositiveInt(rawYear, null);
		const customerId = typeof rawCustomer === "string" && rawCustomer.trim().length ? rawCustomer.trim() : null;

		// If no year is provided, fall back to the latest year in the dataset so fresh inserts are picked up
		let yearToUse = year;
		if (!yearToUse) {
			const latest = await prisma.pamRutin.findFirst({ select: { year: true }, orderBy: { year: "desc" } });
			yearToUse = latest?.year ?? null;
		}

		const where = {
			...(yearToUse ? { year: yearToUse } : {}),
			...(customerId ? { pelangganId: customerId } : {}),
		};

		const rows = await prisma.pamRutin.findMany({
			where,
			select: { pelangganId: true, month: true, year: true, water_bill: true, billAmount: true },
			orderBy: [
				{ pelangganId: "asc" },
				{ year: "asc" },
				{ month: "asc" },
			],
		});

		let pelangganList = [];
		let pelangganMap = {};

		if (customerId) {
			pelangganList = [customerId];
			const customer = await prisma.masterDataPelanggan.findUnique({
				where: { id: customerId },
				select: { id: true, name: true },
			});
			if (customer) pelangganMap[customer.id] = customer.name;
		} else {
			const pelangganRows = await prisma.masterDataPelanggan.findMany({ select: { id: true, name: true } });
			pelangganList = pelangganRows.map((p) => p.id);
			pelangganMap = pelangganRows.reduce((acc, cur) => {
				acc[cur.id] = cur.name;
				return acc;
			}, {});

			// Ensure customers present in pamRutin rows are not dropped even if missing in master data
			const pelangganFromRows = Array.from(new Set(rows.map((r) => r.pelangganId).filter(Boolean)));
			const existingIds = new Set(pelangganList);
			pelangganFromRows.forEach((pid) => {
				if (!existingIds.has(pid)) {
					pelangganList.push(pid);
					pelangganMap[pid] = pelangganMap[pid] || pid;
				}
			});
		}

		if (pelangganList.length === 0) {
			return res.status(200).json({
				status: 200,
				message: "pam_rutin_chart",
				data: [],
				meta: { tahun: year, customer_id: customerId },
			});
		}

		const buildPamUsed = (pelangganId) => {
			return Array.from({ length: 12 }, (_, idx) => {
				const month = idx + 1;
				const found = rows.find((r) => r.pelangganId === pelangganId && r.month === month && (!year || r.year === year));
				return {
					bulan: MONTH_LABELS[idx],
					water_bill: toInt(found?.water_bill),
					billAmount: toInt(found?.billAmount),
				};
			});
		};

		const data = pelangganList.map((pid) => ({
			customer: pelangganMap[pid] || pid || "Unknown",
			pelangganId: pid,
			pamUsed: buildPamUsed(pid),
		}));

		return res.status(200).json({
			status: 200,
			message: "pam_rutin_chart",
			data,
			meta: { tahun: yearToUse, customer_id: customerId },
		});
	} catch (error) {
		console.error("GET PAM RUTIN CHART ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
