import { PrismaClient } from "@prisma/client";

// Reuse Prisma client in dev to avoid exhausting connections on hot reload
const globalForPrisma = globalThis;
let prisma = globalForPrisma.prisma;
if (!prisma) {
	prisma = new PrismaClient();
	if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
}

export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		const DEFAULT_LIMIT = 10;
		const MAX_LIMIT = 100;

		const parsePositiveInt = (val, fallback) => {
			const n = parseInt(val, 10);
			return Number.isFinite(n) && n > 0 ? n : fallback;
		};

		const page = parsePositiveInt(req.query.page, 1);
		const limit = Math.min(parsePositiveInt(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);
		const search = (req.query.search || "").toString().trim();

		const where = search
			? {
				OR: [
					{ name: { contains: search, mode: "insensitive" } },
					{ username: { contains: search, mode: "insensitive" } },
					{ phone: { contains: search, mode: "insensitive" } },
					{ jabatan: { contains: search, mode: "insensitive" } },
				],
			}
			: undefined;

		const total = await prisma.user.count({ where });
		const users = await prisma.user.findMany({
			where,
			orderBy: { id: "asc" },
			skip: (page - 1) * limit,
			take: limit,
			select: {
				id: true,
				name: true,
				phone: true,
				jabatan: true,
				username: true,
				role: true,
			},
		});

		const totalPage = total === 0 ? 0 : Math.ceil(total / limit);

		return res.status(200).json({
			status: 200,
			message: "users_fetched",
			data: users,
			meta: {
				total_row: total,
				total_page: totalPage,
				page,
				limit,
			},
		});
	} catch (error) {
		console.error("GET USERS ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
