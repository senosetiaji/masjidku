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

const parseDate = (val) => {
	if (!val) return null;
	const d = new Date(val);
	return isNaN(d.getTime()) ? null : d;
};

export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		// Auth via HMAC session cookie (same as other endpoints)
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

		// Optional date filters: startDate/endDate OR month/year
		const startDate = parseDate(req.query.startDate || req.query.start_date);
		const endDate = parseDate(req.query.endDate || req.query.end_date);

		// Support month/year aliases via date range
		const rawMonth = req.query.month ?? req.query.bulan;
		const rawYear = req.query.year ?? req.query.tahun;
		const monthCandidate = parsePositiveInt(rawMonth, null);
		const yearCandidate = parsePositiveInt(rawYear, null);
		let monthYearRange = null;
		if (monthCandidate && monthCandidate >= 1 && monthCandidate <= 12 && yearCandidate) {
			const from = new Date(yearCandidate, monthCandidate - 1, 1);
			const to = new Date(yearCandidate, monthCandidate, 1); // exclusive upper bound
			monthYearRange = { from, to };
		}

		// Build search filters (notes and pelanggan name)
		let pelangganIdsFromSearch = [];
		if (search) {
			const matchedPelanggan = await prisma.masterDataPelanggan.findMany({
				where: {
					name: { contains: search },
				},
				select: { id: true },
			});
			pelangganIdsFromSearch = matchedPelanggan.map((p) => p.id);
		}

		const searchOR = search
			? [
					{ notes: { contains: search } },
					...(pelangganIdsFromSearch.length ? [{ pelangganId: { in: pelangganIdsFromSearch } }] : []),
				]
			: [];

		const where = {
			...(pelangganId ? { pelangganId } : {}),
			...(searchOR.length ? { OR: searchOR } : {}),
			...(startDate || endDate || monthYearRange
				? {
						date: {
							...(startDate ? { gte: startDate } : {}),
							...(endDate ? { lt: endDate } : {}),
							...(monthYearRange ? { gte: monthYearRange.from, lt: monthYearRange.to } : {}),
						},
					}
				: {}),
		};

		const distinctPelanggan = await prisma.pamPemasangan.findMany({
			where,
			select: { pelangganId: true },
			distinct: ["pelangganId"],
		});
		const total = distinctPelanggan.length;
		const totalPage = total === 0 ? 0 : Math.ceil(total / limit);
		const offset = (page - 1) * limit;

		let groupedPage = [];
		if (total) {
			groupedPage = await prisma.pamPemasangan.groupBy({
				by: ["pelangganId"],
				where,
				_max: { createdAt: true, updatedAt: true, date: true },
				orderBy: [
					{ _max: { date: "desc" } },
					{ pelangganId: "asc" },
				],
				skip: offset,
				take: limit,
			});
		}

		const pagePelangganIds = groupedPage.map((group) => group.pelangganId).filter(Boolean);

		let pelangganMap = {};
		if (pagePelangganIds.length) {
			const pelangganList = await prisma.masterDataPelanggan.findMany({
				where: { id: { in: pagePelangganIds } },
				select: { id: true, name: true, installationBill: true },
			});
			pelangganMap = pelangganList.reduce((acc, cur) => {
				acc[cur.id] = cur;
				return acc;
			}, {});
		}

		let paymentsMap = {};
		if (pagePelangganIds.length) {
			const paymentsWhere = { ...where, pelangganId: { in: pagePelangganIds } };
			const paymentsRows = await prisma.pamPemasangan.findMany({
				where: paymentsWhere,
				orderBy: [{ date: "asc" }, { createdAt: "asc" }],
			});
			paymentsMap = paymentsRows.reduce((acc, payment) => {
				if (!acc[payment.pelangganId]) acc[payment.pelangganId] = [];
				acc[payment.pelangganId].push(payment);
				return acc;
			}, {});
		}

		const data = groupedPage.map((group) => {
			const pelangganData = pelangganMap[group.pelangganId] || {};
			const payments = paymentsMap[group.pelangganId] || [];
			const formattedPayments = payments.map((payment, index) => ({
				creditIndex: `Pembayaran ke - ${index + 1}`,
				amount: payment.amount,
			}));
			const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
			const installationBill = pelangganData.installationBill ?? 0;
			return {
				id: group.pelangganId,
				pelangganName: pelangganData.name ?? null,
				payments: formattedPayments,
        installationBill: installationBill,
				billsToPay: installationBill - totalPaid,
				createdAt: (group._max?.createdAt || new Date()).toISOString(),
				updateAt: (group._max?.updatedAt || group._max?.createdAt || new Date()).toISOString(),
			};
		});

		return res.status(200).json({
			status: 200,
			message: "pam_pemasangan_fetched",
			data,
			meta: {
				total_row: total,
				total_page: totalPage,
				page,
				limit,
				search,
				pelanggan_id: pelangganId || null,
			},
		});
	} catch (error) {
		console.error("GET PAM PEMASANGAN ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}

