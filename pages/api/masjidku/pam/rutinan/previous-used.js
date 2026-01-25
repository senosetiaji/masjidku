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

const parsePositiveInt = (val, fallback = null) => {
	const n = parseInt(val, 10);
	return Number.isFinite(n) && n > 0 ? n : fallback;
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

		const pelangganId = (req.query.pelangganId || req.query.pelanggan_id || "").toString().trim();
		const rawMonth = req.query.month ?? req.query.bulan;
		const rawYear = req.query.year ?? req.query.tahun;
		const monthCandidate = parsePositiveInt(rawMonth, null);
		const month = monthCandidate && monthCandidate >= 1 && monthCandidate <= 12 ? monthCandidate : null;
		const year = parsePositiveInt(rawYear, null);

		if (!pelangganId) {
			return res.status(400).json({ message: "invalid_pelangganId" });
		}
		if (!year) {
			return res.status(400).json({ message: "invalid_year" });
		}
		if (!month) {
			return res.status(400).json({ message: "invalid_month" });
		}

		// Compute previous month/year
		const prevMonth = month === 1 ? 12 : month - 1;
		const prevYear = month === 1 ? year - 1 : year;

		const prev = await prisma.pamRutin.findFirst({
			where: {
				pelangganId,
				month: prevMonth,
				year: prevYear,
			},
			orderBy: [{ createdAt: "desc" }],
		});

		return res.status(200).json({
			status: 200,
			message: "pam_rutinan_previous_used",
			data: prev
				? {
					id: prev.id,
					pelangganId: prev.pelangganId,
					month: prev.month,
					year: prev.year,
					previous_used: prev.previous_used,
					current_used: prev.current_used,
					water_bill: prev.water_bill,
					billAmount: prev.billAmount,
					paidAmount: prev.paidAmount,
					status: prev.status,
					notes: prev.notes,
					paymentDate: prev.paymentDate ? prev.paymentDate.toISOString() : null,
					createdAt: prev.createdAt.toISOString(),
					updatedAt: prev.updatedAt.toISOString(),
				}
			: null,
			meta: {
				pelangganId,
				bulan: month,
				tahun: year,
				prev_bulan: prevMonth,
				prev_tahun: prevYear,
			},
		});
	} catch (error) {
		console.error("GET PAM RUTINAN PREVIOUS USED ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}