import crypto from "crypto";

const SECRET = process.env.APP_SECRET || "dev-secret";

export const getTokenFromCookie = (cookieHeader = "") => {
  const sessionCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("session="));

  if (!sessionCookie) return null;
  return sessionCookie.slice("session=".length) || null;
};

export const getTokenFromRequest = (req) => {
  const authHeader = req?.headers?.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return getTokenFromCookie(req?.headers?.cookie || "") || null;
};

export const verifySessionToken = (token) => {
  if (!token) return null;

  try {
    const [encoded, signature] = decodeURIComponent(token).split(".");
    if (!encoded || !signature) return null;

    const expected = crypto.createHmac("sha256", SECRET).update(encoded).digest("hex");
    const expectedBuf = Buffer.from(expected, "hex");
    const signatureBuf = Buffer.from(signature, "hex");

    if (expectedBuf.length !== signatureBuf.length) return null;
    if (!crypto.timingSafeEqual(expectedBuf, signatureBuf)) return null;

    const json = Buffer.from(encoded, "base64url").toString("utf8");
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
};

export const authenticateSessionUser = async ({ req, res, prisma, allowedRoles = [], expectedTenantKey = null }) => {
  const token = getTokenFromRequest(req);
  const session = verifySessionToken(token);

  if (!session?.id) {
    res.status(401).json({ message: "unauthorized" });
    return null;
  }

  if (expectedTenantKey && session?.tenant && session.tenant !== expectedTenantKey) {
    res.status(403).json({ message: "tenant_mismatch" });
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: String(session.id) },
    select: { id: true, role: true },
  });

  if (!user) {
    res.status(401).json({ message: "invalid_session_user" });
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    res.status(403).json({ message: "forbidden" });
    return null;
  }

  return {
    user,
    session,
  };
};
