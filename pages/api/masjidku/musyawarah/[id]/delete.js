import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const globalForPrisma = globalThis;
let prisma = globalForPrisma.prisma;
if (!prisma) {
	prisma = new PrismaClient();
	if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
}

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
	} catch (error) {
		return null;
	}
};

export default async function handler(req, res) {
	if (req.method !== "DELETE") {
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

		const userExists = await prisma.user.findUnique({
			where: { id: String(session.id) },
			select: { id: true },
		});
		if (!userExists) {
			return res.status(401).json({ message: "invalid_session_user" });
		}

		const { id } = req.query || {};
		const musyawarahId = typeof id === "string" ? id.trim() : "";
		if (!musyawarahId) {
			return res.status(400).json({ message: "invalid_id" });
		}

		const existing = await prisma.musyawarah.findUnique({
			where: { id: musyawarahId },
			select: { id: true },
		});
		if (!existing) {
			return res.status(404).json({ message: "musyawarah_not_found" });
		}

		await prisma.musyawarah.delete({ where: { id: musyawarahId } });

		return res.status(200).json({
			status: 200,
			message: "musyawarah_deleted",
			data: { id: musyawarahId },
		});
	} catch (error) {
		console.error("DELETE MUSYAWARAH ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
