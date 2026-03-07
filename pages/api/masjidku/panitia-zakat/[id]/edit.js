import crypto from "crypto";
import { getTenantPrisma } from "../../../../../lib/helpers/tenantPrisma";

// Prisma singleton (avoid new clients per hot-reload)

const SECRET = process.env.APP_SECRET || "dev-secret";
const VALID_ROLES = new Set(["ketua", "bendahara", "amil"]);

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

		const { name, phone, serviceYear, serviceYears, role } = req.body || {};
		const serviceYearInput = serviceYear ?? serviceYears;

		if (!name || !phone || serviceYearInput === undefined || serviceYearInput === null || !role) {
			return res.status(400).json({ message: "missing_fields" });
		}

		const normalizedRole = String(role).toLowerCase();
		if (!VALID_ROLES.has(normalizedRole)) {
			return res.status(400).json({ message: "invalid_role" });
		}

		const parsedYears = Number(serviceYearInput);
		if (!Number.isInteger(parsedYears) || parsedYears < 0) {
			return res.status(400).json({ message: "invalid_years_of_service" });
		}

		const updated = await prisma.panitiaZakat.update({
			where: { id },
			data: {
				name: String(name),
				phone: String(phone),
				serviceYear: parsedYears,
				role: normalizedRole,
			},
		});

		return res.status(200).json({
			status: 200,
			message: "panitia_zakat_updated",
			data: {
				id: updated.id,
				name: updated.name,
				phone: updated.phone,
				serviceYear: updated.serviceYear,
				role: updated.role,
				createdAt: updated.createdAt.toISOString(),
				updatedAt: updated.updatedAt.toISOString(),
			},
		});
	} catch (error) {
		console.error("EDIT PANITIA ZAKAT ERROR:", error);
		if (error?.code === "P2025") {
			return res.status(404).json({ message: "panitia_zakat_not_found" });
		}
		return res.status(500).json({ message: "server_error" });
	}
}