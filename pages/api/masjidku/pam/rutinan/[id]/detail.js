import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

// Prisma singleton to avoid multiple connections during hot reload
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

		const userExists = await prisma.user.findUnique({
			where: { id: String(session.id) },
			select: { id: true },
		});

		if (!userExists) {
			return res.status(401).json({ message: "invalid_session_user" });
		}

		const { id: idParam } = req.query;
		const id = Array.isArray(idParam) ? idParam[0] : idParam;

		if (!id || typeof id !== "string" || id.trim().length === 0) {
			return res.status(400).json({ message: "invalid_id" });
		}

		const pam = await prisma.pamRutin.findUnique({
			where: { id: id.trim() },
		});

		if (!pam) {
			return res.status(404).json({ message: "pam_rutinan_not_found" });
		}

		let pelangganName = null;
		if (pam.pelangganId) {
			const pelanggan = await prisma.masterDataPelanggan.findUnique({
				where: { id: pam.pelangganId },
				select: { name: true },
			});
			pelangganName = pelanggan?.name ?? null;
		}

		return res.status(200).json({
			status: 200,
			message: "pam_rutinan_detail",
			data: {
				id: pam.id,
				pelangganId: pam.pelangganId,
				pelangganName,
				month: pam.month,
				year: pam.year,
				previous_used: pam.previous_used,
				current_used: pam.current_used,
				water_bill: pam.water_bill,
				billAmount: pam.billAmount,
				paidAmount: pam.paidAmount,
				status: pam.status,
				notes: pam.notes,
				paymentDate: pam.paymentDate ? pam.paymentDate.toISOString() : null,
				createdAt: pam.createdAt.toISOString(),
				updatedAt: pam.updatedAt.toISOString(),
			},
		});
	} catch (error) {
		console.error("GET PAM RUTINAN DETAIL ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
