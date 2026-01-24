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

		const item = await prisma.inventaris.findFirst({
			where: {
				id: id.toString(),
				userId,
			},
			select: {
				id: true,
				name: true,
				quantity: true,
				condition: true,
				description: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!item) {
			return res.status(404).json({ message: "inventaris_not_found" });
		}

		return res.status(200).json({
			status: 200,
			message: "inventaris_detail_fetched",
			data: {
				id: item.id,
				name: item.name,
				quantity: item.quantity,
				condition: item.condition,
				description: item.description,
				createdAt: item.createdAt.toISOString(),
				updatedAt: item.updatedAt.toISOString(),
			},
		});
	} catch (error) {
		console.error("GET INVENTARIS DETAIL ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
