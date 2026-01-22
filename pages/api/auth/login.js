import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Use a global singleton for Prisma Client so we don't create new instances
// on every hot-reload / request (prevents connection exhaustion in dev/serverless).
const globalForPrisma = globalThis;
let prisma = globalForPrisma.prisma;
if (!prisma) {
  prisma = new PrismaClient();
  // Only attach to global in non-production to avoid long-lived connections in prod
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password wajib diisi" });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ message: "User tidak ditemukan" });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: "Password salah" });
    }

    // jangan kirim password ke frontend
    return res.status(200).json({
      id: user.id,
      name: user.name,
      role: user.role,
      username: user.username,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
