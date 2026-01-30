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
const VALID_CONDITIONS = new Set(["baik", "perlu_perbaikan", "rusak"]);

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
		const cookieHeader = req.headers.cookie || "";
		const sessionCookie = cookieHeader.split(";").find((c) => c.trim().startsWith("session="));
		const token = sessionCookie ? sessionCookie.trim().replace("session=", "") : null;
		const session = verifyToken(token);
		if (!session?.id) {
			return res.status(401).json({ message: "unauthorized" });
		}

		const userId = String(session.id);

		const userExists = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!userExists) {
			return res.status(401).json({ message: "invalid_session_user" });
		}

		const { id } = req.query;
		if (!id) {
			return res.status(400).json({ message: "missing_id" });
		}

		const target = await prisma.inventaris.findFirst({
			where: { id: id.toString(), userId },
			select: { id: true },
		});

		if (!target) {
			return res.status(404).json({ message: "inventaris_not_found" });
		}

		const payload = Array.isArray(req.body) ? req.body : [];
		if (!payload.length) {
			return res.status(400).json({ message: "payload_must_be_array" });
		}

		const first = payload[0] || {};
		const { name, quantity, condition, description = "" } = first;
		const cleanName = (name || "").toString().trim();

		if (!cleanName || typeof quantity === "undefined" || quantity === null || !condition) {
			return res.status(400).json({ message: "missing_fields" });
		}

		const parsedQty = Number(quantity);
		if (!Number.isFinite(parsedQty) || parsedQty < 0) {
			return res.status(400).json({ message: "invalid_quantity" });
		}

		if (!VALID_CONDITIONS.has(condition)) {
			return res.status(400).json({ message: "invalid_condition" });
		}

		await prisma.inventaris.update({
			where: { id: id.toString() },
			data: {
				name: cleanName,
				quantity: Math.trunc(parsedQty),
				condition,
				description: description || "",
			},
		});

		return res.status(200).json({
			status: 200,
			message: "inventaris_updated",
		});
	} catch (error) {
		console.error("UPDATE INVENTARIS ERROR:", error);
		if (error?.code === "P2003") {
			return res.status(400).json({ message: "foreign_key_constraint_failed" });
		}
		return res.status(500).json({ message: "server_error" });
	}
}
