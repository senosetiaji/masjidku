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
const VALID_ROLES = ["warga", "pemuka agama", "lembaga sosial"];
const VALID_ZAKAT_TYPES = ["fitrah", "mal"];

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
		const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
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
		const roleCandidate = (normalizeQueryValue(req.query.role) || "").toString().trim().toLowerCase();
		const zakatTypeCandidate = (normalizeQueryValue(req.query.zakat_type ?? req.query.zakatType) || "").toString().trim().toLowerCase();

		const roleFilter = VALID_ROLES.includes(roleCandidate) ? roleCandidate : null;
		const zakatTypeFilter = VALID_ZAKAT_TYPES.includes(zakatTypeCandidate) ? zakatTypeCandidate : null;

		const where = {
			...(search
				? {
					OR: [
						{ name: { contains: search } },
						{ address: { contains: search } },
						{ phone: { contains: search } },
						{ role: { contains: search } },
					],
				}
				: {}),
			...(roleFilter ? { role: roleFilter } : {}),
			...(zakatTypeFilter ? { zakatType: zakatTypeFilter } : {}),
		};

		const total = await prisma.penerimaZakat.count({ where });

		const rows = await prisma.penerimaZakat.findMany({
			where,
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			skip: (page - 1) * limit,
			take: limit,
			select: {
				id: true,
				name: true,
				address: true,
				phone: true,
				role: true,
				zakatType: true,
				amount: true,
				receivingYear: true,
				createdAt: true,
			},
		});

		const data = rows.map((item) => ({
			id: item.id,
			name: item.name,
			address: item.address,
			phone: item.phone,
			role: item.role,
			zakatType: item.zakatType,
			amount: item.amount,
			receivingYear: item.receivingYear,
			createdAt: item.createdAt.toISOString(),
		}));

		const totalPage = total === 0 ? 0 : Math.ceil(total / limit);

		return res.status(200).json({
			status: 200,
			message: "penerima_zakat_fetched",
			data,
			meta: {
				total_row: total,
				total_page: totalPage,
				page,
				limit,
				search,
				role: roleFilter,
				zakatType: zakatTypeFilter,
			},
		});
	} catch (error) {
		console.error("GET PENERIMA ZAKAT ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}