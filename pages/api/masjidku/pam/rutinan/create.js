import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

// Prisma singleton to avoid multiple clients in dev hot-reload
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

const normalizeStatus = (val) => {
	if (!val) return "";
	const cleaned = val.toString().trim().toLowerCase().replace(/_/g, "-");
	if (["paid", "half-paid", "unpaid"].includes(cleaned)) return cleaned;
	return "";
};

const toIntOrNull = (val) => {
	if (val === null || val === undefined || val === "") return null;
	const n = parseInt(val, 10);
	return Number.isFinite(n) ? n : null;
};

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		// Auth
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

		// Extract body
		const {
			pelangganId,
			month,
			year,
			bulan,
			tahun,
			previous_used,
			current_used,
			water_bill,
			billAmount,
			paidAmount,
			status,
			notes,
			paymentDate,
		} = req.body || {};

		// Basic validation
		if (!pelangganId || typeof pelangganId !== "string" || pelangganId.trim().length === 0) {
			return res.status(400).json({ message: "invalid_pelangganId" });
		}
		// Support aliases: bulan/tahun as month/year
		const monthVal = toIntOrNull(month ?? bulan);
		const yearVal = toIntOrNull(year ?? tahun);
		if (!monthVal || monthVal < 1 || monthVal > 12) {
			return res.status(400).json({ message: "invalid_month" });
		}
		if (!yearVal || yearVal < 1) {
			return res.status(400).json({ message: "invalid_year" });
		}

		// Uniqueness: prevent duplicate pelangganId for same month-year (most reasonable constraint)
		const existing = await prisma.pamRutin.findFirst({
			where: {
				pelangganId: pelangganId.trim(),
				month: monthVal,
				year: yearVal,
			},
		});

		if (existing) {
			return res.status(400).json({ message: "customer_already_exist" });
		}

		const prevVal = toIntOrNull(previous_used);
		const currVal = toIntOrNull(current_used);
		const waterVal = toIntOrNull(water_bill);
		const billVal = toIntOrNull(billAmount);
		const paidVal = toIntOrNull(paidAmount);
		const statusVal = normalizeStatus(status);

		const created = await prisma.pamRutin.create({
			data: {
				pelangganId: pelangganId.trim(),
				month: monthVal,
				year: yearVal,
				previous_used: prevVal ?? 0,
				current_used: currVal ?? 0,
				water_bill: waterVal ?? 0,
				billAmount: billVal ?? 0,
				paidAmount: paidVal ?? 0,
				status: statusVal || "unpaid",
				notes: typeof notes === "string" ? notes : "",
				paymentDate: paymentDate ? new Date(paymentDate) : null,
			},
		});

		let pelangganName = null;
		if (created.pelangganId) {
			const pelanggan = await prisma.masterDataPelanggan.findUnique({
				where: { id: created.pelangganId },
				select: { name: true },
			});
			pelangganName = pelanggan?.name ?? null;
		}

		return res.status(200).json({
			status: 200,
			message: "pam_rutinan_created",
			data: {
				id: created.id,
				pelangganId: created.pelangganId,
				pelangganName,
				month: created.month,
				year: created.year,
				previous_used: created.previous_used,
				current_used: created.current_used,
				water_bill: created.water_bill,
				billAmount: created.billAmount,
				paidAmount: created.paidAmount,
				status: created.status,
				notes: created.notes,
				paymentDate: created.paymentDate ? created.paymentDate.toISOString() : null,
				createdAt: created.createdAt.toISOString(),
				updatedAt: created.updatedAt.toISOString(),
			},
		});
	} catch (error) {
		console.error("CREATE PAM RUTINAN ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}