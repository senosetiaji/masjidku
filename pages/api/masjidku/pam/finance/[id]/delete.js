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

    const existing = await prisma.pamKas.findFirst({
      where: { id: financeId, userId },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "finance_not_found" });
    }

    await prisma.pamKas.delete({ where: { id: financeId } });

    return res.status(200).json({
      status: 200,
      message: "finance_deleted",
    });
  } catch (error) {
    console.error("DELETE FINANCE ERROR:", error);
    return res.status(500).json({ message: "server_error" });
  }
}
