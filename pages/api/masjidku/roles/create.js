import { authenticateSessionUser } from "@/lib/helpers/apiSessionAuth";
import { getTenantPrisma } from "../../../../lib/helpers/tenantPrisma";

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
      },
      select: { id: true },
    });

    if (duplicate) {
      return res.status(400).json({ status: 400, message: "role_already_exists" });
    }

    const created = await prisma.roles.create({
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
      message: "role_created",
      data: {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("CREATE ROLE ERROR:", error);
    return res.status(500).json({ status: 500, message: "server_error" });
  }
}
