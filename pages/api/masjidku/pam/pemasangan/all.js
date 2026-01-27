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

		const total = await prisma.pamPemasangan.count({ where });

		const rows = await prisma.pamPemasangan.findMany({
			where,
			orderBy: [{ date: "desc" }, { createdAt: "desc" }],
			skip: (page - 1) * limit,
			take: limit,
		});

		const pelangganIds = Array.from(new Set(rows.map((r) => r.pelangganId).filter(Boolean)));
		const pelangganMap = pelangganIds.length
			? (
					await prisma.masterDataPelanggan.findMany({
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
			date: item.date.toISOString(),
			amount: item.amount,
			notes: item.notes,
			createdAt: item.createdAt.toISOString(),
			updatedAt: item.updatedAt.toISOString(),
		}));

		const totalPage = total === 0 ? 0 : Math.ceil(total / limit);

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

