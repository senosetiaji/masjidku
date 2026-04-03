import { authenticateSessionUser } from "@/lib/helpers/apiSessionAuth";
import { getTenantPrisma } from "../../../../../lib/helpers/tenantPrisma";

const ALLOWED_ROLES = ["admin", "superadmin"];

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { prisma } = getTenantPrisma(req);
    const authUser = await authenticateSessionUser({
      req,
      res,
      prisma,
      allowedRoles: ALLOWED_ROLES,
    });
    if (!authUser) return;

    const { id } = req.query || {};
    const roleId = typeof id === "string" ? id.trim() : "";
    if (!roleId) {
      return res.status(400).json({ status: 400, message: "invalid_id" });
    }

    const existing = await prisma.roles.findUnique({
      where: { id: roleId },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({ status: 404, message: "role_not_found" });
    }

    const permissionCount = await prisma.permissions.count({
      where: { role_id: roleId },
    });

    if (permissionCount > 0) {
      await prisma.permissions.deleteMany({
        where: { role_id: roleId },
      });
    }

    await prisma.roles.delete({
      where: { id: roleId },
    });

    return res.status(200).json({
      status: 200,
      message: "role_deleted",
      data: { id: roleId },
    });
  } catch (error) {
    console.error("DELETE ROLE ERROR:", error);
    return res.status(500).json({ status: 500, message: "server_error" });
  }
}
