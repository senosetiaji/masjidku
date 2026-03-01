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
const VALID_TYPES = new Set(["hewan", "uang"]);
const VALID_ANIMAL_TYPES = new Set(["kambing", "sapi", "domba"]);

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
		const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
		if (!userExists) {
			return res.status(401).json({ message: "invalid_session_user" });
		}

		const { name, date, type, animalType, amount, price, description = "" } = req.body || {};

		if (!name || !date || !type || amount === undefined || amount === null || price === undefined || price === null) {
			return res.status(400).json({ message: "missing_fields" });
		}

		const normalizedType = String(type).toLowerCase();
		if (!VALID_TYPES.has(normalizedType)) {
			return res.status(400).json({ message: "invalid_type" });
		}

		const normalizedAnimalType = animalType ? String(animalType).toLowerCase() : null;
		if (normalizedType === "hewan") {
			if (!normalizedAnimalType || !VALID_ANIMAL_TYPES.has(normalizedAnimalType)) {
				return res.status(400).json({ message: "invalid_animal_type" });
			}
		}

		const parsedAmount = Number(amount);
		if (!Number.isFinite(parsedAmount)) {
			return res.status(400).json({ message: "invalid_amount" });
		}

		const parsedPrice = Number(price);
		if (!Number.isFinite(parsedPrice)) {
			return res.status(400).json({ message: "invalid_price" });
		}

		const parsedDate = new Date(date);
		if (Number.isNaN(parsedDate.getTime())) {
			return res.status(400).json({ message: "invalid_date" });
		}

		await prisma.qurban.create({
			data: {
				name: String(name),
				date: parsedDate,
				type: normalizedType,
				animalType: normalizedType === "hewan" ? normalizedAnimalType : null,
				amount: Math.trunc(parsedAmount),
				price: Math.trunc(parsedPrice),
				description: String(description || ""),
			},
		});

		return res.status(201).json({ status: 201, message: "qurban_created" });
	} catch (error) {
		console.error("CREATE QURBAN ERROR:", error);
		if (error?.code === "P2003") {
			return res.status(400).json({ message: "foreign_key_constraint_failed" });
		}
		return res.status(500).json({ message: "server_error" });
	}
}