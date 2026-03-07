import {
	getTokenFromRequest,
	verifySessionToken,
} from "../../../../lib/helpers/apiSessionAuth";
import { getTenantPrisma } from "../../../../lib/helpers/tenantPrisma";

export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const { tenant } = getTenantPrisma(req);

	const token = getTokenFromRequest(req);
	if (!token) {
    const meta = { message: "unauthorized", status: 401 };
		return res.status(401).json({...meta});
	}

	const user = verifySessionToken(token);
	if (!user) {
    const meta = { message: "unauthorized", status: 401 };
		return res.status(401).json({...meta});
	}

	if (user?.tenant && user.tenant !== tenant.tenantKey) {
		return res.status(403).json({ message: "tenant_mismatch", status: 403 });
	}

	try {
		const { prisma } = getTenantPrisma(req);
		const effectiveRole = user.role === "superadmin" ? "admin" : user.role;
		const roleRecord = await prisma.roles.findFirst({
			where: { name: effectiveRole },
			select: {
				id: true,
				name: true,
				permissions: {
					select: {
						name: true,
						description: true,
					},
				},
			},
		});

		const permissions = roleRecord?.permissions?.map((item) => item.name) || [];
		const permissionDetails = roleRecord?.permissions || [];

		const safeUser = {
			id: user.id,
			name: user.name,
			role: user.role,
			effectiveRole,
			username: user.username,
			tenant: tenant.tenantKey,
			permissions: user.role === "superadmin" ? ["*", ...permissions] : permissions,
			permissionDetails,
		};

		return res.status(200).json({ status: 200, message: "OK", data: safeUser });
	} catch (error) {
		console.error("CURRENT USER ERROR:", error);
		return res.status(500).json({ status: 500, message: "server_error" });
	}
}
