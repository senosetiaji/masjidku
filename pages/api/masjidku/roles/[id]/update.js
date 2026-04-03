import { authenticateSessionUser } from "@/lib/helpers/apiSessionAuth";
import { getTenantPrisma } from "../../../../../lib/helpers/tenantPrisma";

const ALLOWED_ROLES = ["admin", "superadmin"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
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

    const { name: rawName, description: rawDescription } = req.body || {};
    const name = typeof rawName === "string" ? rawName.trim() : "";
    const description = typeof rawDescription === "string" ? rawDescription.trim() : "";

    if (!name) {
      return res.status(400).json({ status: 400, message: "invalid_name" });
    }

    if (!description) {
      return res.status(400).json({ status: 400, message: "invalid_description" });
    }

    const duplicate = await prisma.roles.findFirst({
      where: {
        name: { equals: name },
        NOT: { id: roleId },
      },
      select: { id: true },
    });

    if (duplicate) {
      return res.status(400).json({ status: 400, message: "role_already_exists" });
    }

    const updated = await prisma.roles.update({
      where: { id: roleId },
      data: {
        name,
        description,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      status: 200,
      message: "role_updated",
      data: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("UPDATE ROLE ERROR:", error);
    return res.status(500).json({ status: 500, message: "server_error" });
  }
}
