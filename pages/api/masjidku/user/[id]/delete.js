import { getTenantPrisma } from "../../../../../lib/helpers/tenantPrisma";

// Reuse Prisma client in dev to avoid exhausting connections on hot reload

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
  	const { prisma, tenant } = getTenantPrisma(req);
    const { id: idParam } = req.query;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const userId = typeof id === "string" ? id.trim() : "";

    if (!userId) {
      return res.status(400).json({ message: "invalid_id" });
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return res.status(404).json({ message: "user_not_found" });
    }

    await prisma.user.delete({ where: { id: userId } });

    const safeUser = {
      id: existing.id,
      name: existing.name,
      phone: existing.phone,
      jabatan: existing.jabatan,
      username: existing.username,
      role: existing.role,
    };

    return res.status(200).json({
      status: 200,
      message: "user_deleted",
      data: safeUser,
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return res.status(500).json({ message: "server_error" });
  }
}
