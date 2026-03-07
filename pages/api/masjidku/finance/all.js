import { authenticateSessionUser } from "../../../../lib/helpers/apiSessionAuth";
import { getTenantPrisma } from "../../../../lib/helpers/tenantPrisma";

export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		const { prisma, tenant } = getTenantPrisma(req);
		const authResult = await authenticateSessionUser({
			req,
			res,
			prisma,
			expectedTenantKey: tenant.tenantKey,
		});

		if (!authResult) return;

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

		const allowedTypes = ["income", "expense"];
		const typeFilter = allowedTypes.includes(typeCandidate) ? typeCandidate : null;

		const periodStart = dateFilter?.gte ?? null;

		const baseWhere = {
			...(search
				? {
					OR: [
						{ description: { contains: search } },
						{ type: { contains: search } },
					],
				}
				: {}),
			...(dateFilter ? { date: dateFilter } : {}),
		};

		const where = {
			...baseWhere,
			...(typeFilter ? { type: typeFilter } : {}),
		};

		let openingSaldo = 0;
		if (periodStart) {
			const [priorIncome, priorExpense] = await Promise.all([
				prisma.keuangan.aggregate({
					where: { date: { lt: periodStart }, type: "income" },
					_sum: { amount: true },
				}),
				prisma.keuangan.aggregate({
					where: { date: { lt: periodStart }, type: "expense" },
					_sum: { amount: true },
				}),
			]);

			openingSaldo = (priorIncome._sum.amount || 0) - (priorExpense._sum.amount || 0);
		}

		const total = await prisma.keuangan.count({ where });

		const rows = await prisma.keuangan.findMany({
			where,
			orderBy: [{ date: "asc" }, { createdAt: "asc" }, { id: "asc" }],
			skip: (page - 1) * limit,
			take: limit,
			select: {
				id: true,
				date: true,
				amount: true,
				type: true,
				createdAt: true,
				description: true,
			},
		});

		let initialSaldo = openingSaldo;
		if (page > 1 && rows.length > 0) {
			const first = rows[0];
			const boundaryWhere = {
				...where,
				OR: [
					{ date: { lt: first.date } },
					{ date: first.date, createdAt: { lt: first.createdAt } },
					{ date: first.date, createdAt: first.createdAt, id: { lt: first.id } },
				],
			};

			const [priorIncome, priorExpense] = await Promise.all([
				prisma.keuangan.aggregate({ where: { ...boundaryWhere, type: "income" }, _sum: { amount: true } }),
				prisma.keuangan.aggregate({ where: { ...boundaryWhere, type: "expense" }, _sum: { amount: true } }),
			]);

			initialSaldo = (priorIncome._sum.amount || 0) - (priorExpense._sum.amount || 0);
		}

		let runningSaldo = initialSaldo;
		const data = rows.map((item) => {
			runningSaldo += item.type === "income" ? item.amount : -item.amount;
			return {
				id: item.id,
				date: item.date.toISOString(),
				amount: item.amount,
				type: item.type,
				description: item.description,
				saldo: runningSaldo,
			};
		});

		const [sumIncome, sumExpense] = await Promise.all([
			prisma.keuangan.aggregate({
				where: { ...baseWhere, type: "income" },
				_sum: { amount: true },
			}),
			prisma.keuangan.aggregate({
				where: { ...baseWhere, type: "expense" },
				_sum: { amount: true },
			}),
		]);

		const incomeSum = sumIncome._sum.amount || 0;
		const expenseSum = sumExpense._sum.amount || 0;
		const totalSaldo = openingSaldo + incomeSum - expenseSum;

		const totalPage = total === 0 ? 0 : Math.ceil(total / limit);

		return res.status(200).json({
			status: 200,
			message: "finance_fetched",
			data,
			totalSaldo,
			tenant: tenant.tenantKey,
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
