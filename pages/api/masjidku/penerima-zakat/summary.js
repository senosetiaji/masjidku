import crypto from "crypto";
import { getTenantPrisma } from "../../../../lib/helpers/tenantPrisma";

// Prisma singleton (avoid new clients per hot-reload)

const SECRET = process.env.APP_SECRET || "dev-secret";
const VALID_ROLES = new Set(["warga", "pemuka agama", "lembaga sosial"]);
const VALID_ZAKAT_TYPES = new Set(["fitrah", "mal"]);

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
		const roleCandidate = (normalizeQueryValue(req.query.role) || "").toString().trim().toLowerCase();
		const zakatTypeCandidate = (normalizeQueryValue(req.query.zakat_type ?? req.query.zakatType) || "").toString().trim().toLowerCase();

		const roleFilter = VALID_ROLES.has(roleCandidate) ? roleCandidate : null;
		const zakatTypeFilter = VALID_ZAKAT_TYPES.has(zakatTypeCandidate) ? zakatTypeCandidate : null;

		const where = {
			...(roleFilter ? { role: roleFilter } : {}),
			...(zakatTypeFilter ? { zakatType: zakatTypeFilter } : {}),
		};

		const [countAll, sumFitrah, sumMal] = await Promise.all([
			prisma.penerimaZakat.count({ where }),
			prisma.penerimaZakat.aggregate({ where: { ...where, zakatType: "fitrah" }, _sum: { amount: true } }),
			prisma.penerimaZakat.aggregate({ where: { ...where, zakatType: "mal" }, _sum: { amount: true } }),
		]);

		return res.status(200).json({
			status: 200,
			message: "penerima_zakat_summary_fetched",
			data: {
				totalPenerima: countAll,
				totalFitrah: sumFitrah._sum.amount || 0,
				totalMal: sumMal._sum.amount || 0,
			},
		});
	} catch (error) {
		console.error("GET PENERIMA ZAKAT SUMMARY ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}