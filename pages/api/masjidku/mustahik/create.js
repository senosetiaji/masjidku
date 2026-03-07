import crypto from "crypto";
import { getTenantPrisma } from "../../../../lib/helpers/tenantPrisma";

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

const parseIntStrict = (value) => {
	if (value === undefined || value === null) return NaN;
	const num = Number(value);
	if (!Number.isFinite(num)) return NaN;
	return Math.trunc(num);
};

const parseAmount = (value) => {
	if (value === undefined || value === null) return NaN;
	if (typeof value === "number") return value;
	const normalized = String(value).replace(/\s+/g, "").replace(",", ".");
	const parsed = Number(normalized);
	return Number.isFinite(parsed) ? parsed : NaN;
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
		if (!name || !address || !phone || !role || !zakatType || amount === undefined || receivingYear === undefined) {
			return res.status(400).json({ message: "missing_fields" });
		}

		const normalizedRole = String(role).toLowerCase().trim();
		if (!VALID_ROLES.has(normalizedRole)) {
			return res.status(400).json({ message: "invalid_role" });
		}

		const normalizedZakatType = String(zakatType).toLowerCase().trim();
		if (!VALID_ZAKAT_TYPES.has(normalizedZakatType)) {
			return res.status(400).json({ message: "invalid_zakat_type" });
		}

		const parsedAmount = parseAmount(amount);
		if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
			return res.status(400).json({ message: "invalid_amount" });
		}

		const parsedReceivingYear = parseIntStrict(receivingYear);
		if (!Number.isFinite(parsedReceivingYear) || parsedReceivingYear < 1900 || parsedReceivingYear > 3000) {
			return res.status(400).json({ message: "invalid_receiving_year" });
		}

		const created = await prisma.penerimaZakat.create({
			data: {
				name: String(name),
				address: String(address),
				phone: String(phone),
				role: normalizedRole,
				zakatType: normalizedZakatType,
				amount: parsedAmount,
				receivingYear: parsedReceivingYear,
			},
		});

		return res.status(201).json({
			status: 201,
			message: "mustahik_created",
			data: {
				id: created.id,
				name: created.name,
				address: created.address,
				phone: created.phone,
				role: created.role,
				zakatType: created.zakatType,
				amount: created.amount,
				receivingYear: created.receivingYear,
				createdAt: created.createdAt.toISOString(),
				updatedAt: created.updatedAt.toISOString(),
			},
		});
	} catch (error) {
		console.error("CREATE MUSTAHIK ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}