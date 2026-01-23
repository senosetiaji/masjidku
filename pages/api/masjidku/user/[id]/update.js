import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Reuse Prisma client in dev to avoid exhausting connections on hot reload
const globalForPrisma = globalThis;
let prisma = globalForPrisma.prisma;
if (!prisma) {
  prisma = new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
}

const VALID_ROLES = new Set(["superadmin", "ketua", "anggota", "sekretaris", "bendahara"]);
const SALT_ROUNDS = 10;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id: idParam } = req.query;
    const id = Array.isArray(idParam) ? parseInt(idParam[0], 10) : parseInt(idParam, 10);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "invalid_id" });
    }

    const { name, phone, jabatan, username, password, role } = req.body || {};

    // Collect fields to update
    const data = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (jabatan !== undefined) data.jabatan = jabatan;
    if (username !== undefined) data.username = username;
    if (role !== undefined) {
      if (!VALID_ROLES.has(role)) {
        return res.status(400).json({ message: "invalid_role" });
      }
      data.role = role;
    }
    if (password) {
      data.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "no_fields_to_update" });
    }

    // Ensure user exists
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "user_not_found" });
    }

    // If username is changing, ensure uniqueness
    if (data.username && data.username !== existing.username) {
      const usernameTaken = await prisma.user.findUnique({ where: { username: data.username } });
      if (usernameTaken) {
        return res.status(409).json({ message: "username_already_exists" });
      }
    }

    const updated = await prisma.user.update({ where: { id }, data });

    const safeUser = {
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      jabatan: updated.jabatan,
      username: updated.username,
      role: updated.role,
    };

    return res.status(200).json({
      status: 200,
      message: "user_updated",
      data: safeUser,
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    return res.status(500).json({ message: "server_error" });
  }
}
