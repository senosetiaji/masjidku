import bcrypt from "bcryptjs";
import { authenticateSessionUser } from "@/lib/helpers/apiSessionAuth";
import { getTenantPrisma } from "../../../../lib/helpers/tenantPrisma";

const SALT_ROUNDS = 10;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
  	const { prisma, tenant } = getTenantPrisma(req);
    const authUser = await authenticateSessionUser({ req, res, prisma });
    if (!authUser) return;

    const { oldPassword, newPassword, confirmPassword } = req.body || {};
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ status: 400, message: "missing_required_fields" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: 400, message: "password_confirmation_not_match" });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ status: 400, message: "new_password_min_6_characters" });
    }

    const user = await prisma.user.findUnique({
      where: { id: String(authUser.id) },
      select: { id: true, password: true },
    });

    if (!user) {
      return res.status(401).json({ status: 401, message: "invalid_session_user" });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({ status: 400, message: "old_password_not_match" });
    }

    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return res.status(400).json({ status: 400, message: "new_password_must_be_different" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      status: 200,
      message: "password_changed",
      data: null,
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({ status: 500, message: "server_error" });
  }
}
