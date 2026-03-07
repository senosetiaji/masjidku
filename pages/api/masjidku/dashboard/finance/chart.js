import crypto from "crypto";
import { getTenantPrisma } from "../../../../../lib/helpers/tenantPrisma";

// Prisma singleton (avoid new clients per hot-reload)

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

/**
 * API handler for retrieving financial chart summary data
 * 
 * @async
 * @function handler
 * @param {Object} req - Next.js request object
 * @param {string} req.method - HTTP method
 * @param {Object} req.headers - Request headers including cookies
 * @param {Object} req.query - Query parameters
 * @param {string|string[]} [req.query.year] - Filter year (alternative: tahun)
 * @param {string|string[]} [req.query.month] - Filter month 1-12 (alternative: bulan)
 * @param {string|string[]} [req.query.user_id] - Filter by user ID (alternative: userId)
 * @param {Object} res - Next.js response object
 * 
 * @returns {Promise<void>} JSON response containing:
 * - 405: Method not allowed (non-GET requests)
 * - 401: Unauthorized (invalid/missing session token or user not found)
 * - 200: Success with financial summary containing:
 *   - total_income: Sum of all income type transactions matching filters (number, minimum 0)
 *   - total_expense: Sum of all expense type transactions matching filters (number, minimum 0)
 *   - meta: Filter metadata (year, month, user_id)
 * - 500: Server error
 * 
 * @description
 * Validates user session via JWT token from cookies.
 * Retrieves aggregated income and expense totals from keuangan table.
 * Supports filtering by year, month, and/or user_id.
 * If no year specified, defaults to latest transaction year.
 * 
 * @note Totals are calculated via Prisma aggregate _sum function and default to 0 if null
 */
export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		const { prisma, tenant } = getTenantPrisma(req);
		// Disable HTTP caching to avoid stale 304 responses when params change
		res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
		res.setHeader("Pragma", "no-cache");
		res.setHeader("Expires", "0");
		if (typeof res.removeHeader === "function") res.removeHeader("ETag");

		const cookieHeader = req.headers.cookie || "";
		const sessionCookie = cookieHeader.split(";").find((c) => c.trim().startsWith("session="));
		const token = sessionCookie ? sessionCookie.trim().replace("session=", "") : null;
		const session = verifyToken(token);
		if (!session?.id) {
			return res.status(401).json({ message: "unauthorized" });
		}

		if (session?.tenant && session.tenant !== tenant.tenantKey) {
			return res.status(403).json({ message: "tenant_mismatch" });
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

		const normalizeQueryValue = (val) => (Array.isArray(val) ? val[0] : val);

		const yearCandidate = parsePositiveInt(normalizeQueryValue(req.query.year ?? req.query.tahun), null);
		const monthCandidate = parsePositiveInt(normalizeQueryValue(req.query.month ?? req.query.bulan), null);
		const validMonth = monthCandidate && monthCandidate >= 1 && monthCandidate <= 12 ? monthCandidate : null;
		const requestedUser = normalizeQueryValue(req.query.user_id ?? req.query.userId);
		const userFilter = requestedUser ? String(requestedUser) : null;

		// If no year provided, fallback to latest year that exists in keuangan
		let effectiveYear = yearCandidate;
		if (!effectiveYear) {
			const latest = await prisma.keuangan.findFirst({ select: { date: true }, orderBy: { date: "desc" } });
			effectiveYear = latest ? latest.date.getFullYear() : null;
		}

		// Build date range using UTC to avoid timezone shifts that can move records across year boundaries
		let dateFilter = null;
		if (effectiveYear && validMonth) {
			const from = new Date(Date.UTC(effectiveYear, validMonth - 1, 1));
			const to = new Date(Date.UTC(effectiveYear, validMonth, 1));
			dateFilter = { gte: from, lt: to };
		} else if (effectiveYear) {
			const from = new Date(Date.UTC(effectiveYear, 0, 1));
			const to = new Date(Date.UTC(effectiveYear + 1, 0, 1));
			dateFilter = { gte: from, lt: to };
		}

		const where = {
			...(userFilter ? { userId: userFilter } : {}),
			...(dateFilter ? { date: dateFilter } : {}),
		};

		const [incomeAgg, expenseAgg] = await Promise.all([
			prisma.keuangan.aggregate({ where: { ...where, type: "income" }, _sum: { amount: true } }),
			prisma.keuangan.aggregate({ where: { ...where, type: "expense" }, _sum: { amount: true } }),
		]);

		const totalIncome = incomeAgg._sum.amount || 0;
		const totalExpense = expenseAgg._sum.amount || 0;

		return res.status(200).json({
			status: 200,
			message: "finance_chart_summary",
			data: {
				total_income: totalIncome,
				total_expense: totalExpense,
			},
			meta: {
				year: effectiveYear || null,
				month: validMonth,
				user_id: userFilter,
			},
		});
	} catch (error) {
		console.error("GET FINANCE CHART ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
