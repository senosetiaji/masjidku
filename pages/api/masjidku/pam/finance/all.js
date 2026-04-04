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

export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		const { prisma, tenant } = getTenantPrisma(req);
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

		const DEFAULT_LIMIT = 10;
		const MAX_LIMIT = 100;

		const parsePositiveInt = (val, fallback) => {
			const n = parseInt(val, 10);
			return Number.isFinite(n) && n > 0 ? n : fallback;
		};

		const normalizeQueryValue = (val) => {
			if (Array.isArray(val)) return val[0];
			return val;
		};

		const page = parsePositiveInt(normalizeQueryValue(req.query.page), 1);
		const limit = Math.min(parsePositiveInt(normalizeQueryValue(req.query.limit), DEFAULT_LIMIT), MAX_LIMIT);
		const search = (normalizeQueryValue(req.query.search) || "").toString().trim();
		const monthCandidate = parsePositiveInt(normalizeQueryValue(req.query.month ?? req.query.bulan), null);
		const yearCandidate = parsePositiveInt(normalizeQueryValue(req.query.year ?? req.query.tahun), null);
		const typeCandidate = (normalizeQueryValue(req.query.tipe_transaksi ?? req.query.type) || "").toString().trim().toLowerCase();
		const validTransactionTypes = ["income", "expense"];
		const getSignedAmount = (type, amount) => {
			if (type === "income") return amount;
			if (type === "expense") return -amount;
			return 0;
		};

		let dateFilter = null;
		if (monthCandidate && monthCandidate >= 1 && monthCandidate <= 12 && yearCandidate) {
			const from = new Date(yearCandidate, monthCandidate - 1, 1);
			const to = new Date(yearCandidate, monthCandidate, 1);
			dateFilter = { gte: from, lt: to };
		} else if (yearCandidate) {
			const from = new Date(yearCandidate, 0, 1);
			const to = new Date(yearCandidate + 1, 0, 1);
			dateFilter = { gte: from, lt: to };
		}

		const typeFilter = validTransactionTypes.includes(typeCandidate) ? typeCandidate : null;

		const periodStart = dateFilter?.gte ?? null;

		const baseConditions = [{ type: { in: validTransactionTypes } }];
		if (search) {
			baseConditions.push({
				OR: [
					{ description: { contains: search } },
					{ type: { contains: search } },
				],
			});
		}
		if (typeFilter) {
			baseConditions.push({ type: typeFilter });
		}

		const saldoBaseWhere = { AND: baseConditions };
		const where = dateFilter ? { AND: [saldoBaseWhere, { date: dateFilter }] } : saldoBaseWhere;

		let openingSaldo = 0;
		if (periodStart) {
			const [priorIncome, priorExpense] = await Promise.all([
				prisma.pamKas.aggregate({
					where: { AND: [saldoBaseWhere, { date: { lt: periodStart }, type: "income" }] },
					_sum: { amount: true },
				}),
				prisma.pamKas.aggregate({
					where: { AND: [saldoBaseWhere, { date: { lt: periodStart }, type: "expense" }] },
					_sum: { amount: true },
				}),
			]);

			openingSaldo = (priorIncome._sum.amount || 0) - (priorExpense._sum.amount || 0);
		}

		const total = await prisma.pamKas.count({ where });
		const skip = (page - 1) * limit;

		const [sumIncome, sumExpense] = await Promise.all([
			prisma.pamKas.aggregate({
				where: { AND: [where, { type: "income" }] },
				_sum: { amount: true },
			}),
			prisma.pamKas.aggregate({
				where: { AND: [where, { type: "expense" }] },
				_sum: { amount: true },
			}),
		]);

		const incomeSum = sumIncome._sum.amount || 0;
		const expenseSum = sumExpense._sum.amount || 0;
		const totalSaldo = openingSaldo + incomeSum - expenseSum;

		const rows = await prisma.pamKas.findMany({
			where,
			orderBy: [{ date: "desc" }, { createdAt: "desc" }, { id: "desc" }],
			skip,
			take: limit,
			select: {
	        id: true,
				date: true,
				createdAt: true,
				amount: true,
				type: true,
				description: true,
				photoUrl: true,
			},
		});

		let runningSaldo = totalSaldo;
		if (skip > 0) {
			const previousRows = await prisma.pamKas.findMany({
				where,
				orderBy: [{ date: "desc" }, { createdAt: "desc" }, { id: "desc" }],
				take: skip,
				select: {
					type: true,
					amount: true,
				},
			});

			runningSaldo = totalSaldo - previousRows.reduce((sum, item) => sum + getSignedAmount(item.type, item.amount), 0);
		}

		const data = rows.map((item) => {
			const saldoAfter = runningSaldo;
			runningSaldo -= getSignedAmount(item.type, item.amount);
			return {
	      id: item.id,
				date: item.date.toISOString(),
				amount: item.amount,
				type: item.type,
				description: item.description,
				photoUrl: item.photoUrl,
				saldo: saldoAfter,
			};
		});

		const totalPage = total === 0 ? 0 : Math.ceil(total / limit);

		return res.status(200).json({
			status: 200,
			message: "finance_fetched",
			data,
			totalSaldo,
			meta: {
				total_row: total,
				total_page: totalPage,
				page,
				limit,
				search,
				month: monthCandidate || null,
				year: yearCandidate || null,
				type: typeFilter,
			},
		});
	} catch (error) {
		console.error("GET FINANCE ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
