import crypto from "crypto";
import { getTenantPrisma } from "../../../../lib/helpers/tenantPrisma";

// Prisma singleton (avoid new clients per hot-reload)

const SECRET = process.env.APP_SECRET || "dev-secret";
const VALID_TYPES = new Set(["fitrah", "mal"]);

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
		const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
		if (!userExists) {
			return res.status(401).json({ message: "invalid_session_user" });
		}

		const normalizeQueryValue = (val) => (Array.isArray(val) ? val[0] : val);
		const parsePositiveInt = (val, fallback) => {
			const n = parseInt(val, 10);
			return Number.isFinite(n) && n > 0 ? n : fallback;
		};

		const yearCandidate = parsePositiveInt(normalizeQueryValue(req.query.year ?? req.query.tahun), null);
		const typeCandidate = (normalizeQueryValue(req.query.type) || "").toString().trim().toLowerCase();

		let dateFilter = null;
		if (yearCandidate) {
			const from = new Date(yearCandidate, 0, 1);
			const to = new Date(yearCandidate + 1, 0, 1);
			dateFilter = { gte: from, lt: to };
		}

		const typeFilter = VALID_TYPES.has(typeCandidate) ? typeCandidate : null;

		const baseWhere = {
			...(dateFilter ? { date: dateFilter } : {}),
			...(typeFilter ? { type: typeFilter } : {}),
		};

		const [countAll, sumUang, sumNonUang] = await Promise.all([
			prisma.zakats.count({ where: baseWhere }),
			prisma.zakats.aggregate({
				where: { ...baseWhere, zakatType: "uang" },
				_sum: { amount: true },
			}),
			prisma.zakats.aggregate({
				where: { ...baseWhere, NOT: { zakatType: "uang" } },
				_sum: { amount: true },
			}),
		]);

		return res.status(200).json({
			status: 200,
			message: "zakat_summary_fetched",
			data: {
				totalPezakat: countAll,
				totalZakatUang: sumUang._sum.amount || 0,
				totalZakatBeras: sumNonUang._sum.amount || 0,
			},
		});
	} catch (error) {
		console.error("GET ZAKAT SUMMARY ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
