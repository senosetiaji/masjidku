import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Use a global singleton for Prisma Client so we don't create new instances
// on every hot-reload / request (prevents connection exhaustion in dev/serverless).
const globalForPrisma = globalThis;
let prisma = globalForPrisma.prisma;
if (!prisma) {
  prisma = new PrismaClient();
  // Only attach to global in non-production to avoid long-lived connections in prod
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
}

const SECRET = process.env.APP_SECRET || "dev-secret";
const ONE_WEEK = 60 * 60 * 24 * 7; // seconds

const signToken = (payload) => {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(encoded).digest("hex");
  return `${encoded}.${signature}`;
};

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
      const safeUser = {
        id: user.id,
        name: user.name,
        role: user.role,
        username: user.username,
      };

      const token = signToken(safeUser);
      const isProd = process.env.NODE_ENV === "production";
      const cookie = `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ONE_WEEK}${isProd ? "; Secure" : ""}`;
      res.setHeader("Set-Cookie", cookie);

      return res.status(200).json({
        status: 200,
        message: "Login berhasil",
        data: {
          user: safeUser,
          token,
        },
      });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
