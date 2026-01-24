import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

// Prisma singleton (avoid new clients per hot-reload)
const globalForPrisma = globalThis;
let prisma = globalForPrisma.prisma;
if (!prisma) {
	prisma = new PrismaClient();
	if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
}

const SECRET = process.env.APP_SECRET || "dev-secret";

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

const parsePositiveInt = (val, fallback) => {
	const n = parseInt(val, 10);
	return Number.isFinite(n) && n > 0 ? n : fallback;
};

const normalizeStatus = (val) => {
	if (!val) return "";
	const cleaned = val.toString().trim().toLowerCase().replace(/_/g, "-");
	if (["paid", "half-paid", "unpaid"].includes(cleaned)) return cleaned;
	return "";
};

export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		const cookieHeader = req.headers.cookie || "";
		const sessionCookie = cookieHeader.split(";").find((c) => c.trim().startsWith("session="));
		const token = sessionCookie ? sessionCookie.trim().replace("session=", "") : null;
		const session = verifyToken(token);
		if (!session?.id) {
			return res.status(401).json({ message: "unauthorized" });
		}

		const userExists = await prisma.user.findUnique({
			where: { id: String(session.id) },
			select: { id: true },
		});

		if (!userExists) {
			return res.status(401).json({ message: "invalid_session_user" });
		}

		const DEFAULT_LIMIT = 10;
		const MAX_LIMIT = 100;

		const page = parsePositiveInt(req.query.page, 1);
		const limit = Math.min(parsePositiveInt(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);
		const search = (req.query.search || "").toString().trim();
		const pelangganId = (req.query.pelangganId || req.query.pelanggan_id || "").toString().trim();
		const status = normalizeStatus(req.query.payment_status ?? req.query.status);

		// Support month/year aliases: bulan/tahun fallback
		const rawMonth = req.query.month ?? req.query.bulan;
		const rawYear = req.query.year ?? req.query.tahun;
		const monthCandidate = parsePositiveInt(rawMonth, null);
		const month = monthCandidate && monthCandidate >= 1 && monthCandidate <= 12 ? monthCandidate : null;
		const year = parsePositiveInt(rawYear, null);

		const where = {
			...(pelangganId ? { pelangganId } : {}),
			...(status ? { status } : {}),
			...(month ? { month } : {}),
			...(year ? { year } : {}),
			...(search
				? {
						OR: [
							{ notes: { contains: search, mode: "insensitive" } },
							{ status: { contains: search, mode: "insensitive" } },
						],
					}
				: {}),
		};

		const total = await prisma.pamRutin.count({ where });

		const rows = await prisma.pamRutin.findMany({
			where,
			orderBy: [
				{ year: "desc" },
				{ month: "desc" },
				{ createdAt: "desc" },
			],
			skip: (page - 1) * limit,
			take: limit,
		});

		const pelangganIds = Array.from(
			new Set(rows.map((r) => r.pelangganId).filter(Boolean))
		);

		const pelangganMap = pelangganIds.length
			? (await prisma.masterDataPelanggan.findMany({
					where: { id: { in: pelangganIds } },
					select: { id: true, name: true },
				})
			).reduce((acc, cur) => {
				acc[cur.id] = cur.name;
				return acc;
			}, {})
			: {};

		const data = rows.map((item) => ({
			id: item.id,
			pelangganId: item.pelangganId,
			pelangganName: pelangganMap[item.pelangganId] || null,
			month: item.month,
			year: item.year,
			previous_used: item.previous_used,
			current_used: item.current_used,
			water_bill: item.water_bill,
			billAmount: item.billAmount,
			paidAmount: item.paidAmount,
			status: item.status,
			notes: item.notes,
			paymentDate: item.paymentDate?.toISOString(),
			createdAt: item.createdAt.toISOString(),
			updatedAt: item.updatedAt.toISOString(),
		}));

		const totalPage = total === 0 ? 0 : Math.ceil(total / limit);

		return res.status(200).json({
			status: 200,
			message: "pam_rutinan_fetched",
			data,
			meta: {
				total_row: total,
				total_page: totalPage,
				page,
				limit,
				search,
				payment_status: status || null,
			},
		});
	} catch (error) {
		console.error("GET PAM RUTINAN ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
