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

    const { id: idParam } = req.query;
    const pelangganIdParam = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!pelangganIdParam || typeof pelangganIdParam !== "string" || pelangganIdParam.trim().length === 0) {
      return res.status(400).json({ message: "invalid_id" });
    }
    const pelangganId = pelangganIdParam.trim();

    const pelanggan = await prisma.masterDataPelanggan.findUnique({
      where: { id: pelangganId },
      select: { id: true, name: true },
    });
    if (!pelanggan) {
      return res.status(404).json({ message: "pelanggan_not_found" });
    }

    const existingPayments = await prisma.pamPemasangan.findMany({
      where: { pelangganId },
      select: { id: true },
    });
    if (!existingPayments.length) {
      return res.status(404).json({ message: "pam_pemasangan_not_found" });
    }

    await prisma.pamPemasangan.deleteMany({
      where: { pelangganId },
    });

    return res.status(200).json({
      status: 200,
      message: "pam_pemasangan_deleted",
      data: {
        pelangganId,
        pelangganName: pelanggan.name ?? null,
        deletedPayments: existingPayments.length,
      },
    });
  } catch (error) {
    console.error("DELETE PAM PEMASANGAN ERROR:", error);
    return res.status(500).json({ message: "server_error" });
  }
}
