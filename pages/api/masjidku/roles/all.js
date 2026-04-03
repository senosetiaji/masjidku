import { getTenantPrisma } from "../../../../lib/helpers/tenantPrisma";
import { authenticateSessionUser } from "@/lib/helpers/apiSessionAuth";

const DEFAULT_ROLES = ["admin", "ketua", "sekretaris", "bendahara"];

export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		const { prisma, tenant } = getTenantPrisma(req);
		const authUser = await authenticateSessionUser({ req, res, prisma });
		if (!authUser) return;

		const { page: rawPage, limit: rawLimit, search: rawSearch } = req.query || {};
		const page = Math.max(parseInt(rawPage, 10) || 1, 1);
		const limit = Math.max(parseInt(rawLimit, 10) || 10, 1);
		const skip = (page - 1) * limit;
		const search = typeof rawSearch === "string" ? rawSearch.trim() : "";

		const where = search
			? {
				OR: [
					{ name: { contains: search } },
					{ description: { contains: search } },
				],
			}
			: {};

		const totalRow = await prisma.roles.count({ where });
		const roles = await prisma.roles.findMany({
			where,
			orderBy: { name: "asc" },
			skip,
			take: limit,
			select: {
				id: true,
				name: true,
				description: true,
			},
		});

		if (roles.length > 0) {
			const totalPage = Math.max(Math.ceil(totalRow / limit), 1);
			return res.status(200).json({
				status: 200,
				message: "roles_fetched",
				data: roles,
				meta: {
					current_page: page,
					per_page: limit,
					total_page: totalPage,
					total_row: totalRow,
				},
			});
		}

		const fallbackRoles = DEFAULT_ROLES.filter((name) => {
			if (!search) return true;
			return name.toLowerCase().includes(search.toLowerCase());
		}).map((name) => ({
			id: name,
			name,
			description: "",
		}));
		const pagedFallback = fallbackRoles.slice(skip, skip + limit);
		const fallbackTotalRow = fallbackRoles.length;
		const fallbackTotalPage = Math.max(Math.ceil(fallbackTotalRow / limit), 1);

		return res.status(200).json({
			status: 200,
			message: "roles_fetched_fallback",
			data: pagedFallback,
			meta: {
				current_page: page,
				per_page: limit,
				total_page: fallbackTotalPage,
				total_row: fallbackTotalRow,
			},
		});
	} catch (error) {
		console.error("GET ROLES ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
