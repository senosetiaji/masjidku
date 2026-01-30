import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

// Prisma singleton (avoid multiple clients in dev hot-reload)
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

const parsePositiveInt = (val, fallback = null) => {
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
		// Auth check
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

		// Params: tahun/bulan aliases
		const rawMonth = req.query.month ?? req.query.bulan;
		const rawYear = req.query.year ?? req.query.tahun;
		const monthCandidate = parsePositiveInt(rawMonth, null);
		const month = monthCandidate && monthCandidate >= 1 && monthCandidate <= 12 ? monthCandidate : null;
		const year = parsePositiveInt(rawYear, null);

		const where = {
			status: { in: ["paid", "half-paid", "half_paid"] },
			...(year ? { year } : {}),
			...(month ? { month } : {}),
		};

		const summary = await prisma.pamRutin.aggregate({
			where,
			_sum: { paidAmount: true },
		});

		const distinctPelanggan = await prisma.pamRutin.groupBy({
			by: ["pelangganId"],
			where,
		});

		return res.status(200).json({
			status: 200,
			message: "pam_rutinan_summary",
			data: {
				total_paid_amount: summary._sum.paidAmount ?? 0,
				total_paid: distinctPelanggan.length,
			},
			meta: {
				tahun: year ?? null,
				bulan: month ?? null,
			},
		});
	} catch (error) {
		console.error("GET PAM RUTINAN SUMMARY ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}