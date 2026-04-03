import { authenticateSessionUser } from "@/lib/helpers/apiSessionAuth";
import { getTenantPrisma } from "../../../../../lib/helpers/tenantPrisma";

const ALLOWED_ROLES = ["admin", "superadmin"];

export default async function handler(req, res) {
  if (req.method !== "GET") {
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

    const detail = await prisma.roles.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!detail) {
      return res.status(404).json({ status: 404, message: "role_not_found" });
    }

    return res.status(200).json({
      status: 200,
      message: "role_detail",
      data: {
        ...detail,
        createdAt: detail.createdAt.toISOString(),
        updatedAt: detail.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("DETAIL ROLE ERROR:", error);
    return res.status(500).json({ status: 500, message: "server_error" });
  }
}
