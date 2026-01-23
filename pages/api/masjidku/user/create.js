import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Reuse Prisma client in dev to avoid connection spam on hot reload
const globalForPrisma = globalThis;
let prisma = globalForPrisma.prisma;
if (!prisma) {
	prisma = new PrismaClient();
	if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
}

const VALID_ROLES = new Set(["superadmin", "ketua", "anggota", "sekretaris", "bendahara"]);
const SALT_ROUNDS = 10;

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		const { name, phone, jabatan, username, password, role } = req.body || {};

		// basic validation
		if (!name || !phone || !jabatan || !username || !password || !role) {
			return res.status(400).json({ message: "missing_required_fields" });
		}

		if (!VALID_ROLES.has(role)) {
			return res.status(400).json({ message: "invalid_role" });
		}

		// ensure username uniqueness
		const existing = await prisma.user.findUnique({ where: { username } });
		if (existing) {
			return res.status(409).json({ message: "username_already_exists" });
		}

		const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

		const newUser = await prisma.user.create({
			data: {
				name,
				phone,
				jabatan,
				username,
				password: hashedPassword,
				role,
			},
		});

		// don't send password back
		const safeUser = {
			id: newUser.id,
			name: newUser.name,
			phone: newUser.phone,
			jabatan: newUser.jabatan,
			username: newUser.username,
			role: newUser.role,
		};

		return res.status(201).json({
			status: 201,
			message: "user_created",
			data: safeUser,
		});
	} catch (error) {
		console.error("CREATE USER ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
