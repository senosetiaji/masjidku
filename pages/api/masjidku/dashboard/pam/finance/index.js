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

		const userId = String(session.id);

		const userExists = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!userExists) {
			return res.status(401).json({ message: "invalid_session_user" });
		}

		const parsePositiveInt = (val, fallback = null) => {
			const n = parseInt(val, 10);
			return Number.isFinite(n) && n > 0 ? n : fallback;
		};

		const normalizeQueryValue = (val) => {
			if (Array.isArray(val)) return val[0];
			return val;
		};

		const yearCandidate = parsePositiveInt(normalizeQueryValue(req.query.year ?? req.query.tahun), null);
		const monthCandidate = parsePositiveInt(normalizeQueryValue(req.query.month ?? req.query.bulan), null);
		const validMonth = monthCandidate && monthCandidate >= 1 && monthCandidate <= 12 ? monthCandidate : null;

		let dateFilter = null;
		if (yearCandidate && validMonth) {
			const from = new Date(yearCandidate, validMonth - 1, 1);
			const to = new Date(yearCandidate, validMonth, 1);
			dateFilter = { gte: from, lt: to };
		} else if (yearCandidate) {
			const from = new Date(yearCandidate, 0, 1);
			const to = new Date(yearCandidate + 1, 0, 1);
			dateFilter = { gte: from, lt: to };
		}

		const where = {
			userId,
			...(dateFilter ? { date: dateFilter } : {}),
		};

		const [incomeAgg, expenseAgg] = await Promise.all([
			prisma.pamKas.aggregate({ where: { ...where, type: "income" }, _sum: { amount: true } }),
			prisma.pamKas.aggregate({ where: { ...where, type: "expense" }, _sum: { amount: true } }),
		]);

		const totalIncome = incomeAgg._sum.amount || 0;
		const totalExpense = expenseAgg._sum.amount || 0;

		return res.status(200).json({
			status: 200,
			message: "pam_finance_summary",
			data: {
				total_income: totalIncome,
				total_expense: totalExpense,
			},
			meta: {
				year: yearCandidate || null,
				month: validMonth,
			},
		});
	} catch (error) {
		console.error("GET PAM FINANCE SUMMARY ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
