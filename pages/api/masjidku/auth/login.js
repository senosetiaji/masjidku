import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getTenantPrisma } from "../../../../lib/helpers/tenantPrisma";

const SECRET = process.env.APP_SECRET || "dev-secret";
const ONE_WEEK = 60 * 60 * 24 * 7; // seconds

const signToken = (payload) => {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(encoded).digest("hex");
  return `${encoded}.${signature}`;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
  	const { prisma, tenant } = getTenantPrisma(req);
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "username_and_password_required" });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ message: "user_not_found" });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: "invalid_password" });
    }

    // jangan kirim password ke frontend
      const safeUser = {
        id: String(user.id),
        name: user.name,
        role: user.role,
        username: user.username,
        tenant: tenant.tenantKey,
      };

      const token = signToken(safeUser);
      const isProd = process.env.NODE_ENV === "production";
      const cookie = `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ONE_WEEK}${isProd ? "; Secure" : ""}`;
      res.setHeader("Set-Cookie", cookie);

      return res.status(200).json({
        status: 200,
        message: "login_successful",
        data: {
          user: safeUser,
          token,
          tenant: tenant.tenantKey,
        },
      });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "server_error" });
  }
}
