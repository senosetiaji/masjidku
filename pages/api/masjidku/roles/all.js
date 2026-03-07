import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
let prisma = globalForPrisma.prisma;
if (!prisma) {
	prisma = new PrismaClient();
	if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
}

const DEFAULT_ROLES = ["admin", "ketua", "sekretaris", "bendahara"];

export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		const roles = await prisma.roles.findMany({
			orderBy: { name: "asc" },
			select: {
				id: true,
				name: true,
				description: true,
			},
		});

		if (roles.length > 0) {
			return res.status(200).json({
				status: 200,
				message: "roles_fetched",
				data: roles,
			});
		}

		const fallbackRoles = DEFAULT_ROLES.map((name) => ({
			id: name,
			name,
			description: "",
		}));

		return res.status(200).json({
			status: 200,
			message: "roles_fetched_fallback",
			data: fallbackRoles,
		});
	} catch (error) {
		console.error("GET ROLES ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
