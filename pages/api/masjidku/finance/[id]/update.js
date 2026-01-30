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
const VALID_TYPES = new Set(["income", "expense"]);

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

		const { id: idParam } = req.query;
		const financeId = Array.isArray(idParam) ? idParam[0] : idParam;

		if (!financeId || typeof financeId !== "string") {
			return res.status(400).json({ message: "invalid_id" });
		}

		// Accept either object payload or array with a single object (frontend might send array)
		const inputBody = Array.isArray(req.body) ? req.body[0] : req.body || {};
		const { date, amount, type, description } = inputBody;
		const data = {};
		if (date !== undefined) {
			const parsedDate = new Date(date);
			if (Number.isNaN(parsedDate.getTime())) {
				return res.status(400).json({ message: "invalid_date" });
			}
			data.date = parsedDate;
		}
		if (amount !== undefined) {
			const parsedAmount = Number(amount);
			if (!Number.isFinite(parsedAmount)) {
				return res.status(400).json({ message: "invalid_amount" });
			}
			data.amount = Math.trunc(parsedAmount);
		}
		if (type !== undefined) {
			if (!VALID_TYPES.has(type)) {
				return res.status(400).json({ message: "invalid_type" });
			}
			data.type = type;
		}
		if (description !== undefined) {
			data.description = description;
		}
		if (Object.keys(data).length === 0) {
			return res.status(400).json({ message: "no_fields_to_update" });
		}

		const existing = await prisma.keuangan.findFirst({
			where: { id: financeId, userId },
		});

		if (!existing) {
			return res.status(404).json({ message: "finance_not_found" });
		}

		const updated = await prisma.keuangan.update({
			where: { id: financeId },
			data,
		});

		const responseData = {
			id: updated.id,
			date: updated.date.toISOString(),
			amount: updated.amount,
			type: updated.type,
			description: updated.description,
		};

		return res.status(200).json({
			status: 200,
			message: "finance_updated",
			data: responseData,
		});
	} catch (error) {
		console.error("UPDATE FINANCE ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
