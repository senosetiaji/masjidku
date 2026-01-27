import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

// Prisma singleton (avoid multiple clients in dev hot-reload)
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

const parsePositiveInt = (val, fallback = null) => {
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const parseDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Auth check
    const cookieHeader = req.headers.cookie || "";
    const sessionCookie = cookieHeader.split(";").find((c) => c.trim().startsWith("session="));
    const token = sessionCookie ? sessionCookie.trim().replace("session=", "") : null;
    const session = verifyToken(token);
    if (!session?.id) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: String(session.id) },
      select: { id: true },
    });
    if (!userExists) {
      return res.status(401).json({ message: "invalid_session_user" });
    }

    const pelangganId = (req.query.pelangganId || req.query.pelanggan_id || "").toString().trim();

    // Params: month/year aliases OR explicit date range
    const rawMonth = req.query.month ?? req.query.bulan;
    const rawYear = req.query.year ?? req.query.tahun;
    const monthCandidate = parsePositiveInt(rawMonth, null);
    const yearCandidate = parsePositiveInt(rawYear, null);

    const startDate = parseDate(req.query.startDate || req.query.start_date);
    const endDate = parseDate(req.query.endDate || req.query.end_date);

    let dateFilter = undefined;
    if (monthCandidate && monthCandidate >= 1 && monthCandidate <= 12 && yearCandidate) {
      const from = new Date(yearCandidate, monthCandidate - 1, 1);
      const to = new Date(yearCandidate, monthCandidate, 1); // exclusive upper bound
      dateFilter = { gte: from, lt: to };
    } else if (startDate || endDate) {
      dateFilter = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lt: endDate } : {}),
      };
    }

    const where = {
      ...(pelangganId ? { pelangganId } : {}),
      ...(dateFilter ? { date: dateFilter } : {}),
    };

    const totalAgg = await prisma.pamPemasangan.aggregate({
      where,
      _sum: { amount: true },
      _count: { _all: true },
    });

    const distinctPelanggan = await prisma.pamPemasangan.groupBy({
      by: ["pelangganId"],
      where,
    });

    return res.status(200).json({
      status: 200,
      message: "pam_pemasangan_summary",
      data: {
        total_amount: totalAgg._sum.amount ?? 0,
        total_records: totalAgg._count._all ?? 0,
        total_pelanggan: distinctPelanggan.length,
      },
      meta: {
        pelanggan_id: pelangganId || null,
        tahun: yearCandidate ?? null,
        bulan: monthCandidate ?? null,
        start_date: startDate ? startDate.toISOString() : null,
        end_date: endDate ? endDate.toISOString() : null,
      },
    });
  } catch (error) {
    console.error("GET PAM PEMASANGAN SUMMARY ERROR:", error);
    return res.status(500).json({ message: "server_error" });
  }
}
