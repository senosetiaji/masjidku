import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

// Prisma singleton to avoid multiple clients in dev hot-reload
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

const toIntOrNull = (val) => {
	if (val === null || val === undefined || val === "") return null;
	const n = parseInt(val, 10);
	return Number.isFinite(n) ? n : null;
};

const parseDateOrNull = (val) => {
	if (!val) return null;
	const d = new Date(val);
	return isNaN(d.getTime()) ? null : d;
};

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		// Auth
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

		// Extract body
		const { pelangganId, date, amount, notes } = req.body || {};

		// Basic validation
		if (!pelangganId || typeof pelangganId !== "string" || pelangganId.trim().length === 0) {
			return res.status(400).json({ message: "invalid_pelangganId" });
		}

		const dateVal = parseDateOrNull(date);
		if (!dateVal) {
			return res.status(400).json({ message: "invalid_date" });
		}

		const amountVal = toIntOrNull(amount);
		if (amountVal === null || amountVal < 0) {
			return res.status(400).json({ message: "invalid_amount" });
		}

		// Optional: prevent exact duplicate (same pelangganId and identical date timestamp)
		const existing = await prisma.pamPemasangan.findFirst({
			where: { pelangganId: pelangganId.trim(), date: dateVal },
			select: { id: true },
		});
		if (existing) {
			return res.status(400).json({ message: "pemasangan_already_exist" });
		}

		const created = await prisma.pamPemasangan.create({
			data: {
				pelangganId: pelangganId.trim(),
				date: dateVal,
				amount: amountVal,
				notes: typeof notes === "string" ? notes : "",
			},
		});

		let pelangganName = null;
		if (created.pelangganId) {
			const pelanggan = await prisma.masterDataPelanggan.findUnique({
				where: { id: created.pelangganId },
				select: { name: true },
			});
			pelangganName = pelanggan?.name ?? null;
		}

		return res.status(200).json({
			status: 200,
			message: "pam_pemasangan_created",
			data: {
				id: created.id,
				pelangganId: created.pelangganId,
				pelangganName,
				date: created.date.toISOString(),
				amount: created.amount,
				notes: created.notes,
				createdAt: created.createdAt.toISOString(),
				updatedAt: created.updatedAt.toISOString(),
			},
		});
	} catch (error) {
		console.error("CREATE PAM PEMASANGAN ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}

