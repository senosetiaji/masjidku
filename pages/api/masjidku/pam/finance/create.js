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
const VALID_TYPES = new Set(["income", "expense", "transfer"]);

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
		// derive user from cookie (set on login)
		const cookieHeader = req.headers.cookie || "";
		const sessionCookie = cookieHeader.split(";").find((c) => c.trim().startsWith("session="));
		const token = sessionCookie ? sessionCookie.trim().replace("session=", "") : null;
		const session = verifyToken(token);
		if (!session?.id) {
			return res.status(401).json({ message: "unauthorized" });
		}

		// normalize user id to string (schema uses String/UUID)
		const userId = String(session.id);

		// ensure user still exists (token could be stale)
		const userExists = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!userExists) {
			return res.status(401).json({ message: "invalid_session_user" });
		}

		const payload = Array.isArray(req.body) ? req.body : [];
		if (!payload.length) {
			return res.status(400).json({ message: "payload_must_be_array" });
		}

		// basic validation & normalization
		const records = [];
		for (const item of payload) {
			const { date, amount, type, description = "" } = item || {};
			if (!date || typeof amount === "undefined" || amount === null || !type) {
				return res.status(400).json({ message: "missing_fields" });
			}

			if (!VALID_TYPES.has(type)) {
				return res.status(400).json({ message: "invalid_type" });
			}

			const parsedAmount = Number(amount);
			if (!Number.isFinite(parsedAmount)) {
				return res.status(400).json({ message: "invalid_amount" });
			}

			const parsedDate = new Date(date);
			if (Number.isNaN(parsedDate.getTime())) {
				return res.status(400).json({ message: "invalid_date" });
			}

			records.push({
				date: parsedDate,
				amount: Math.trunc(parsedAmount),
				type,
				description,
				userId,
			});
		}

		// createMany not available for this model setup; use transaction of creates
		const created = await prisma.$transaction(
			records.map((data) => prisma.pamKas.create({ data }))
		);

		return res.status(201).json({
			status: 201,
			message: "finance_created",
			count: created.length,
		});
	} catch (error) {
		console.error("CREATE FINANCE ERROR:", error);
		// surface known Prisma errors as 400-series
		if (error?.code === "P2003") {
			return res.status(400).json({ message: "foreign_key_constraint_failed" });
		}
		return res.status(500).json({ message: "server_error" });
	}
}
