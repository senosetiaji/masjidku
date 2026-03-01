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
const VALID_TYPES = new Set(["fitrah", "mal"]);
const VALID_ZAKAT_TYPES = new Set(["uang", "barang"]);

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
		const cookieHeader = req.headers.cookie || "";
		const sessionCookie = cookieHeader.split(";").find((c) => c.trim().startsWith("session="));
		const token = sessionCookie ? sessionCookie.trim().replace("session=", "") : null;
		const session = verifyToken(token);
		if (!session?.id) {
			return res.status(401).json({ message: "unauthorized" });
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

		const { name, date, type, zakatType, amount, description = "" } = req.body || {};

		if (!name || !date || !type || !zakatType || amount === undefined || amount === null) {
			return res.status(400).json({ message: "missing_fields" });
		}

		if (!VALID_TYPES.has(String(type).toLowerCase())) {
			return res.status(400).json({ message: "invalid_type" });
		}

		if (!VALID_ZAKAT_TYPES.has(String(zakatType).toLowerCase())) {
			return res.status(400).json({ message: "invalid_zakat_type" });
		}

		const parsedAmount = Number(amount);
		if (!Number.isFinite(parsedAmount)) {
			return res.status(400).json({ message: "invalid_amount" });
		}

		const parsedDate = new Date(date);
		if (Number.isNaN(parsedDate.getTime())) {
			return res.status(400).json({ message: "invalid_date" });
		}

		const updated = await prisma.zakats.update({
			where: { id },
			data: {
				name: String(name),
				date: parsedDate,
				type: String(type).toLowerCase(),
				zakatType: String(zakatType).toLowerCase(),
				amount: Math.trunc(parsedAmount),
				description: String(description || ""),
			},
		});

		return res.status(200).json({
			status: 200,
			message: "zakat_updated",
			data: {
				id: updated.id,
				name: updated.name,
				date: updated.date.toISOString(),
				type: updated.type,
				zakatType: updated.zakatType,
				amount: updated.amount,
				description: updated.description,
				createdAt: updated.createdAt.toISOString(),
				updatedAt: updated.updatedAt.toISOString(),
			},
		});
	} catch (error) {
		console.error("EDIT ZAKAT ERROR:", error);
		if (error?.code === "P2025") {
			return res.status(404).json({ message: "zakat_not_found" });
		}
		return res.status(500).json({ message: "server_error" });
	}
}
