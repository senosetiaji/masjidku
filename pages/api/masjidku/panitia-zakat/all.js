import crypto from "crypto";
import { getTenantPrisma } from "../../../../lib/helpers/tenantPrisma";

// Prisma singleton (avoid new clients per hot-reload)

const SECRET = process.env.APP_SECRET || "dev-secret";
const VALID_ROLES = ["ketua", "bendahara", "amil"];

const verifyToken = (token) => {
	try {
		if (!token) return null;
		const decodedToken = decodeURIComponent(token);
		const [encoded, signature] = decodedToken.split(".");
		if (!encoded || !signature) return null;

		const expected = crypto.createHmac("sha256", SECRET).update(encoded).digest("hex");
		if (expected.length !== signature.length) return null;

		const expectedBuf = Buffer.from(expected, "utf8");
		const signatureBuf = Buffer.from(signature, "utf8");
		if (!crypto.timingSafeEqual(expectedBuf, signatureBuf)) return null;

		const json = Buffer.from(encoded, "base64url").toString("utf8");
		return JSON.parse(json);
	} catch (error) {
		return null;
	}
};

const getSessionTokenFromCookie = (cookieHeader) => {
	if (!cookieHeader) return null;
	const tokenPair = cookieHeader
		.split(";")
		.map((item) => item.trim())
		.find((item) => item.startsWith("session="));
	if (!tokenPair) return null;
	return tokenPair.slice("session=".length) || null;
};

const toIsoOrNull = (value) => {
	if (!value) return null;
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		const { prisma, tenant } = getTenantPrisma(req);
		const cookieHeader = req.headers.cookie || "";
		const token = getSessionTokenFromCookie(cookieHeader);
		const session = verifyToken(token);
		if (!session?.id) {
			return res.status(401).json({ message: "unauthorized" });
		}

		if (session?.tenant && session.tenant !== tenant.tenantKey) {
			return res.status(403).json({ message: "tenant_mismatch" });
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
		const roleFilter = VALID_ROLES.includes(roleCandidate) ? roleCandidate : null;
		const yearCandidate = parsePositiveInt(normalizeQueryValue(req.query.tahun ?? req.query.serviceYear ?? req.query.year), null);

		const where = {
			...(search
				? {
					OR: [
						{ name: { contains: search } },
						{ phone: { contains: search } },
						{ role: { contains: search } },
					],
				}
				: {}),
			...(roleFilter ? { role: roleFilter } : {}),
			...(Number.isFinite(yearCandidate) ? { serviceYear: yearCandidate } : {}),
		};

		const total = await prisma.panitiaZakat.count({ where });

		const rows = await prisma.panitiaZakat.findMany({
			where,
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			skip: (page - 1) * limit,
			take: limit,
			select: {
				id: true,
				name: true,
				phone: true,
				serviceYear: true,
				role: true,
				createdAt: true,
			},
		});

		const data = rows.map((item) => ({
			id: item.id,
			name: item.name,
			phone: item.phone,
			serviceYear: item.serviceYear,
			role: item.role,
			createdAt: toIsoOrNull(item.createdAt),
		}));

		const totalPage = total === 0 ? 0 : Math.ceil(total / limit);

		return res.status(200).json({
			status: 200,
			message: "panitia_zakat_fetched",
			data,
			meta: {
				total_row: total,
				total_page: totalPage,
				page,
				limit,
				search,
				role: roleFilter,
				tahun: Number.isFinite(yearCandidate) ? yearCandidate : null,
			},
		});
	} catch (error) {
		console.error("GET PANITIA ZAKAT ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}