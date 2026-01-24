import { PrismaClient } from "@prisma/client";

// Reuse Prisma client in dev to avoid exhausting connections on hot reload
const globalForPrisma = globalThis;
let prisma = globalForPrisma.prisma;
if (!prisma) {
  prisma = new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id: idParam } = req.query;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id || typeof id !== "string" || id.trim().length === 0) {
      return res.status(400).json({ message: "invalid_id" });
    }

    const user = await prisma.user.findUnique({
      where: { id: id.trim() },
      select: {
        id: true,
        name: true,
        phone: true,
        jabatan: true,
        username: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "user_not_found" });
    }

    return res.status(200).json({
      status: 200,
      message: "user_detail",
      data: user,
    });
  } catch (error) {
    console.error("GET USER DETAIL ERROR:", error);
    return res.status(500).json({ message: "server_error" });
  }
}
