import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

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

const normalizeQueryValue = (val) => {
	if (Array.isArray(val)) return val[0];
	return val;
};

const parsePositiveInt = (val, fallback) => {
	const n = parseInt(val, 10);
	return Number.isFinite(n) && n > 0 ? n : fallback;
};

const parseDate = (val) => {
	if (!val) return null;
	const d = new Date(val);
	return Number.isNaN(d.getTime()) ? null : d;
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
		const page = parsePositiveInt(normalizeQueryValue(req.query.page), 1);
		const parsedLimit = parsePositiveInt(normalizeQueryValue(req.query.limit), DEFAULT_LIMIT);
		const limit = Math.min(parsedLimit, MAX_LIMIT);
		const search = (normalizeQueryValue(req.query.search) || "").toString().trim();
		const startDate = parseDate(normalizeQueryValue(req.query.startDate ?? req.query.start_date));
		const endDate = parseDate(normalizeQueryValue(req.query.endDate ?? req.query.end_date));
		const monthCandidate = parsePositiveInt(normalizeQueryValue(req.query.month ?? req.query.bulan), null);
		const yearCandidate = parsePositiveInt(normalizeQueryValue(req.query.year ?? req.query.tahun), null);

		let dateFilter = null;
		if (monthCandidate && monthCandidate >= 1 && monthCandidate <= 12 && yearCandidate) {
			const from = new Date(yearCandidate, monthCandidate - 1, 1);
			const to = new Date(yearCandidate, monthCandidate, 1);
			dateFilter = { gte: from, lt: to };
		} else if (startDate || endDate) {
			dateFilter = {
				...(startDate ? { gte: startDate } : {}),
				...(endDate ? { lt: endDate } : {}),
			};
		}

		const where = {
			...(search
				? {
					OR: [
						{ topic: { contains: search } },
						{ notes: { contains: search } },
					],
				}
				: {}),
			...(dateFilter ? { date: dateFilter } : {}),
		};

		const total = await prisma.musyawarah.count({ where });
		const totalPage = total === 0 ? 0 : Math.ceil(total / limit);
		const offset = (page - 1) * limit;

		const rows = await prisma.musyawarah.findMany({
			where,
			orderBy: [{ date: "desc" }, { createdAt: "desc" }],
			skip: offset,
			take: limit,
		});

		const data = rows.map((row) => ({
			id: row.id,
			date: row.date.toISOString(),
			topic: row.topic,
			notes: row.notes,
			createdAt: row.createdAt.toISOString(),
			updatedAt: row.updatedAt.toISOString(),
		}));

		return res.status(200).json({
			status: 200,
			message: "musyawarah_fetched",
			data,
			meta: {
				total_row: total,
				total_page: totalPage,
				page,
				limit,
				search,
				start_date: startDate ? startDate.toISOString() : null,
				end_date: endDate ? endDate.toISOString() : null,
				month: monthCandidate || null,
				year: yearCandidate || null,
			},
		});
	} catch (error) {
		console.error("GET MUSYAWARAH ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
