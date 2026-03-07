import { randomUUID } from "crypto";
import permissionCatalog from "@/lib/config/permission-catalog.json";
import { authenticateSessionUser } from "@/lib/helpers/apiSessionAuth";
import { getTenantPrisma } from "../../../../lib/helpers/tenantPrisma";

const MANAGE_ROLES = ["admin", "superadmin"];

const getAllCatalogPermissions = () => {
  return (permissionCatalog?.groups || []).flatMap((group) => group.permissions || []);
};

export default async function handler(req, res) {
  try {
  	const { prisma, tenant } = getTenantPrisma(req);
    const authUser = await authenticateSessionUser({
      req,
      res,
      prisma,
      allowedRoles: MANAGE_ROLES,
    });
    if (!authUser) return;

    if (req.method === "GET") {
      const roles = await prisma.roles.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          permissions: {
            select: {
              name: true,
              description: true,
            },
          },
        },
      });

      const rolePermissions = roles.reduce((acc, role) => {
        acc[role.name] = role.permissions.map((item) => item.name);
        return acc;
      }, {});

      return res.status(200).json({
        status: 200,
        message: "permissions_settings_fetched",
        data: {
          roles: roles.map((role) => ({
            id: role.id,
            name: role.name,
            description: role.description,
          })),
          catalog: permissionCatalog?.groups || [],
          rolePermissions,
        },
      });
    }

    if (req.method === "PUT") {
      const { roleName, permissions } = req.body || {};
      if (!roleName || !Array.isArray(permissions)) {
        return res.status(400).json({ message: "invalid_payload" });
      }

      const role = await prisma.roles.findFirst({ where: { name: roleName }, select: { id: true, name: true } });
      if (!role) {
        return res.status(404).json({ message: "role_not_found" });
      }

      const catalogPermissions = getAllCatalogPermissions();
      const allowedMap = new Map(catalogPermissions.map((item) => [item.name, item.description]));

      const normalizedUnique = [...new Set(permissions.filter((item) => typeof item === "string"))];
      const invalidPermissions = normalizedUnique.filter((name) => !allowedMap.has(name));
      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          message: "invalid_permissions",
          invalidPermissions,
        });
      }

      await prisma.permissions.deleteMany({ where: { role_id: role.id } });
      if (normalizedUnique.length > 0) {
        await prisma.$transaction(
          normalizedUnique.map((name) =>
            prisma.permissions.create({
              data: {
                id: randomUUID(),
                role_id: role.id,
                name,
                description: allowedMap.get(name) || "",
              },
            })
          )
        );
      }

      return res.status(200).json({
        status: 200,
        message: "permissions_updated",
        data: {
          roleName: role.name,
          permissions: normalizedUnique,
        },
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("SETTINGS PERMISSIONS ERROR:", error);
    return res.status(500).json({ message: "server_error" });
  }
}
