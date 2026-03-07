import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
let prisma = globalForPrisma.prisma;
if (!prisma) {
	prisma = new PrismaClient();
	if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
}

const SECRET = process.env.APP_SECRET || "dev-secret";

const getToken = (req) => {
	if (req.headers.authorization?.startsWith("Bearer ")) {
		return req.headers.authorization.slice(7);
	}
	return req.cookies?.session || null;
};

const verifyToken = (token) => {
	try {
		const [payload, signature] = token.split(".");
		if (!payload || !signature) return null;

		const expectedSig = crypto
			.createHmac("sha256", SECRET)
			.update(payload)
			.digest("hex");

		// timing safe compare
		const sigBuf = Buffer.from(signature, "hex");
		const expBuf = Buffer.from(expectedSig, "hex");
		if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
			return null;
		}

		const json = Buffer.from(payload, "base64url").toString("utf8");
		return JSON.parse(json);
	} catch (err) {
		return null;
	}
};

export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const token = getToken(req);
	if (!token) {
    const meta = { message: "unauthorized", status: 401 };
		return res.status(401).json({...meta});
	}

	const user = verifyToken(token);
	if (!user) {
    const meta = { message: "unauthorized", status: 401 };
		return res.status(401).json({...meta});
	}

	try {
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
			permissions: user.role === "superadmin" ? ["*", ...permissions] : permissions,
			permissionDetails,
		};

		return res.status(200).json({ status: 200, message: "OK", data: safeUser });
	} catch (error) {
		console.error("CURRENT USER ERROR:", error);
		return res.status(500).json({ status: 500, message: "server_error" });
	}
}
