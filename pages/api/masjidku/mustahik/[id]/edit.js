import crypto from "crypto";
import { getTenantPrisma } from "../../../../../lib/helpers/tenantPrisma";

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
	if (req.method !== "PUT") {
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

		const rawId = req.query.id;
		const id = Array.isArray(rawId) ? rawId[0] : rawId;
		if (!id) {
			return res.status(400).json({ message: "id_required" });
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

		const updated = await prisma.penerimaZakat.update({
			where: { id },
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

		return res.status(200).json({
			status: 200,
			message: "mustahik_updated",
			data: {
				id: updated.id,
				name: updated.name,
				address: updated.address,
				phone: updated.phone,
				role: updated.role,
				zakatType: updated.zakatType,
				amount: updated.amount,
				receivingYear: updated.receivingYear,
				createdAt: updated.createdAt.toISOString(),
				updatedAt: updated.updatedAt.toISOString(),
			},
		});
	} catch (error) {
		console.error("EDIT MUSTAHIK ERROR:", error);
		if (error?.code === "P2025") {
			return res.status(404).json({ message: "mustahik_not_found" });
		}
		return res.status(500).json({ message: "server_error" });
	}
}