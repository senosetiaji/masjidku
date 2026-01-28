import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

// Prisma singleton (avoid new clients per hot-reload)
const globalForPrisma = globalThis;
let prisma = globalForPrisma.prisma;
if (!prisma) {
	prisma = new PrismaClient();
	if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
}

const SECRET = process.env.APP_SECRET || "dev-secret";

const verifyToken = (token) => {
	if (!token) return null;
	const [encoded, signature] = token.split(".");
	if (!encoded || !signature) return null;
	const expected = crypto.createHmac("sha256", SECRET).update(encoded).digest("hex");
	if (expected !== signature) return null;
	const json = Buffer.from(encoded, "base64url").toString("utf8");
	try {
		return JSON.parse(json);
	} catch (e) {
		return null;
	}
};

const parsePositiveInt = (val, fallback) => {
	const n = parseInt(val, 10);
	return Number.isFinite(n) && n > 0 ? n : fallback;
};

export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		const cookieHeader = req.headers.cookie || "";
		const sessionCookie = cookieHeader.split(";").find((c) => c.trim().startsWith("session="));
		const token = sessionCookie ? sessionCookie.trim().replace("session=", "") : null;
		const session = verifyToken(token);
		if (!session?.id) {
			return res.status(401).json({ message: "unauthorized" });
		}

		// ensure user still exists (token could be stale)
		const userExists = await prisma.user.findUnique({
			where: { id: String(session.id) },
			select: { id: true },
		});

		if (!userExists) {
			return res.status(401).json({ message: "invalid_session_user" });
		}

		const DEFAULT_LIMIT = 10;
		const MAX_LIMIT = 100;

		const page = parsePositiveInt(req.query.page, 1);
		const limit = Math.min(parsePositiveInt(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);
		const search = (req.query.search || "").toString().trim();
		const isAll = (() => {
			const raw = req.query.all;
			if (raw === true || raw === "true" || raw === "1" || raw === 1) return true;
			return false;
		})();

		const where = search
			? {
					OR: [
						{ name: { contains: search } },
						{ address: { contains: search } },
						{ phone: { contains: search } },
					],
				}
			: {};

		if (isAll) {
			const rows = await prisma.masterDataPelanggan.findMany({
				where,
				orderBy: [{ createdAt: "desc" }, { name: "asc" }],
			});

			const data = rows.map((item) => ({
				id: item.id,
				name: item.name,
				address: item.address,
        installationBill: item.installationBill,
				phone: item.phone,
				createdAt: item.createdAt.toISOString(),
				updatedAt: item.updatedAt.toISOString(),
			}));

			return res.status(200).json({
				status: 200,
				message: "pelanggan_fetched",
				data,
			});
		}

		const total = await prisma.masterDataPelanggan.count({ where });

		const rows = await prisma.masterDataPelanggan.findMany({
			where,
			orderBy: [{ createdAt: "desc" }, { name: "asc" }],
			skip: (page - 1) * limit,
			take: limit,
		});

		const data = rows.map((item) => ({
			id: item.id,
			name: item.name,
			address: item.address,
      installationBill: item.installationBill,
			phone: item.phone,
			createdAt: item.createdAt.toISOString(),
			updatedAt: item.updatedAt.toISOString(),
		}));

		const totalPage = total === 0 ? 0 : Math.ceil(total / limit);

		return res.status(200).json({
			status: 200,
			message: "pelanggan_fetched",
			data,
			meta: {
				total_row: total,
				total_page: totalPage,
				page,
				limit,
				search,
			},
		});
	} catch (error) {
		console.error("GET MASTER DATA PELANGGAN ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
