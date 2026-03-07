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
	if (req.method !== "POST") {
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

		const { name, address, phone, role, zakatType, amount, receivingYear } = req.body || {};

		if (!name || !address || !phone || !role || !zakatType || amount === undefined || amount === null || receivingYear === undefined || receivingYear === null) {
			return res.status(400).json({ message: "missing_fields" });
		}

		const normalizedRole = String(role).toLowerCase();
		if (!VALID_ROLES.has(normalizedRole)) {
			return res.status(400).json({ message: "invalid_role" });
		}

		const normalizedZakatType = String(zakatType).toLowerCase();
		if (!VALID_ZAKAT_TYPES.has(normalizedZakatType)) {
			return res.status(400).json({ message: "invalid_zakat_type" });
		}

		const parsedAmount = Number(amount);
		if (!Number.isInteger(parsedAmount) || parsedAmount < 0) {
			return res.status(400).json({ message: "invalid_amount" });
		}

		const parsedYear = Number(receivingYear);
		if (!Number.isInteger(parsedYear) || parsedYear < 0) {
			return res.status(400).json({ message: "invalid_years_receiving" });
		}

		await prisma.penerimaZakat.create({
			data: {
				name: String(name),
				address: String(address),
				phone: String(phone),
				role: normalizedRole,
				zakatType: normalizedZakatType,
				amount: parsedAmount,
				receivingYear: parsedYear,
			},
		});

		return res.status(201).json({ status: 201, message: "penerima_zakat_created" });
	} catch (error) {
		console.error("CREATE PENERIMA ZAKAT ERROR:", error);
		if (error?.code === "P2003") {
			return res.status(400).json({ message: "foreign_key_constraint_failed" });
		}
		return res.status(500).json({ message: "server_error" });
	}
}