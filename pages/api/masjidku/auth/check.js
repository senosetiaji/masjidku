import { authenticateSessionUser } from "@/lib/helpers/apiSessionAuth";
import { getTenantPrisma } from "../../../../lib/helpers/tenantPrisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { prisma, tenant } = getTenantPrisma(req);
    const authUser = await authenticateSessionUser({
      req,
      res,
      prisma,
      expectedTenantKey: tenant.tenantKey,
    });

    if (!authUser) return;

    return res.status(200).json({
      status: 200,
      message: "authenticated",
      data: {
        authenticated: true,
        user: {
          id: String(authUser.user.id),
          role: authUser.user.role,
          name: authUser.session?.name || null,
          username: authUser.session?.username || null,
          tenant: tenant.tenantKey,
        },
      },
    });
  } catch (error) {
    console.error("AUTH CHECK ERROR:", error);
    return res.status(500).json({ status: 500, message: "server_error" });
  }
}