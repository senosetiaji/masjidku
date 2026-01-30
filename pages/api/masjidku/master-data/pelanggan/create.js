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

		const userExists = await prisma.user.findUnique({
			where: { id: String(session.id) },
			select: { id: true },
		});
		if (!userExists) {
			return res.status(401).json({ message: "invalid_session_user" });
		}

		const { name: rawName, address: rawAddress, phone: rawPhone, installationBill: rawInstallationBill } = req.body || {};
		const name = typeof rawName === "string" ? rawName.trim() : "";
		const address = typeof rawAddress === "string" ? rawAddress.trim() : "";
		const phone = typeof rawPhone === "string" ? rawPhone.trim() : "";
		const installationBill = parseInt(rawInstallationBill, 10);

		if (!name) return res.status(400).json({ message: "invalid_name" });
		if (!address) return res.status(400).json({ message: "invalid_address" });
		if (!phone) return res.status(400).json({ message: "invalid_phone" });
		if (!Number.isFinite(installationBill) || installationBill < 0) {
			return res.status(400).json({ message: "invalid_installation_bill" });
		}

		const duplicatePhone = await prisma.masterDataPelanggan.findFirst({
			where: { phone: { equals: phone } },
			select: { id: true },
		});
		if (duplicatePhone) {
			return res.status(400).json({ message: "phone_already_exist" });
		}

		const created = await prisma.masterDataPelanggan.create({
			data: {
				name,
				address,
				phone,
				installationBill,
			},
		});

		return res.status(200).json({
			status: 200,
			message: "pelanggan_created",
			data: {
				id: created.id,
				name: created.name,
				address: created.address,
				phone: created.phone,
				installationBill: created.installationBill,
				createdAt: created.createdAt.toISOString(),
				updatedAt: created.updatedAt.toISOString(),
			},
		});
	} catch (error) {
		console.error("CREATE PELANGGAN ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
