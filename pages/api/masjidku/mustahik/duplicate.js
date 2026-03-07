import crypto from "crypto";
import { getTenantPrisma } from "../../../../lib/helpers/tenantPrisma";

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

const parseIntStrict = (value) => {
  if (value === undefined || value === null) return NaN;
  const num = Number(value);
  if (!Number.isFinite(num)) return NaN;
  return Math.trunc(num);
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
  	const { prisma, tenant } = getTenantPrisma(req);
    const cookieHeader = req.headers.cookie || "";
    const sessionCookie = cookieHeader.split(";").find((c) => c.trim().startsWith("session="));
    const token = sessionCookie ? sessionCookie.trim().replace("session=", "") : null;
    const session = verifyToken(token);
    if (!session?.id) {
      return res.status(401).json({ message: "unauthorized" });
    }

    if (session?.tenant && session.tenant !== tenant.tenantKey) {
    	return res.status(403).json({ message: "tenant_mismatch" });
    }

    const userId = String(session.id);
    const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!userExists) {
      return res.status(401).json({ message: "invalid_session_user" });
    }

    const { fromYear, toYear } = req.body || {};
    if (fromYear === undefined || toYear === undefined) {
      return res.status(400).json({ message: "missing_fields" });
    }

    const parsedFrom = parseIntStrict(fromYear);
    const parsedTo = parseIntStrict(toYear);
    if (!Number.isFinite(parsedFrom) || parsedFrom < 1900 || parsedFrom > 3000) {
      return res.status(400).json({ message: "invalid_from_year" });
    }
    if (!Number.isFinite(parsedTo) || parsedTo < 1900 || parsedTo > 3000) {
      return res.status(400).json({ message: "invalid_to_year" });
    }
    if (parsedFrom === parsedTo) {
      return res.status(400).json({ message: "same_year_not_allowed" });
    }

    const sourceRows = await prisma.penerimaZakat.findMany({
      where: { receivingYear: parsedFrom },
      select: {
        name: true,
        address: true,
        phone: true,
        role: true,
        zakatType: true,
        amount: true,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    if (!sourceRows.length) {
      return res.status(404).json({ message: "source_year_empty" });
    }

    const insertPayload = sourceRows.map((item) => ({
      name: item.name,
      address: item.address,
      phone: item.phone,
      role: item.role,
      zakatType: item.zakatType,
      amount: item.amount,
      receivingYear: parsedTo,
    }));

    // SQLite memiliki batas 999 parameter; gunakan chunk + transaksi create per-row agar aman di semua versi
    const CHUNK_SIZE = 50;
    let inserted = 0;
    for (let i = 0; i < insertPayload.length; i += CHUNK_SIZE) {
      const chunk = insertPayload.slice(i, i + CHUNK_SIZE);
      const tx = chunk.map((data) => prisma.penerimaZakat.create({ data }));
      const result = await prisma.$transaction(tx);
      inserted += result.length;
    }

    return res.status(201).json({
      status: 201,
      message: "mustahik_duplicated",
      data: {
        fromYear: parsedFrom,
        toYear: parsedTo,
        copied: insertPayload.length,
        inserted,
      },
    });
  } catch (error) {
    console.error("DUPLICATE MUSTAHIK ERROR:", error);
      return res.status(500).json({
        message: "server_error",
        code: error?.code || null,
        detail: error?.message || null,
      });
  }
}
