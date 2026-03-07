import crypto from "crypto";
import { getTenantPrisma } from "../../../../../lib/helpers/tenantPrisma";

// Prisma singleton (avoid new clients per hot-reload)

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

		const rawId = req.query.id;
		const id = Array.isArray(rawId) ? rawId[0] : rawId;
		if (!id) {
			return res.status(400).json({ message: "id_required" });
		}

		const penerima = await prisma.penerimaZakat.findUnique({
			where: { id },
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
				updatedAt: true,
			},
		});

		if (!penerima) {
			return res.status(404).json({ message: "penerima_zakat_not_found" });
		}

		return res.status(200).json({
			status: 200,
			message: "penerima_zakat_detail_fetched",
			data: {
				id: penerima.id,
				name: penerima.name,
				address: penerima.address,
				phone: penerima.phone,
				role: penerima.role,
				zakatType: penerima.zakatType,
				amount: penerima.amount,
				receivingYear: penerima.receivingYear,
				createdAt: penerima.createdAt.toISOString(),
				updatedAt: penerima.updatedAt.toISOString(),
			},
		});
	} catch (error) {
		console.error("GET PENERIMA ZAKAT DETAIL ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}