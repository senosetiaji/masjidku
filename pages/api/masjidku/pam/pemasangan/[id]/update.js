import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

// Prisma singleton to avoid multiple connections during hot reload
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

const toIntOrNull = (val) => {
  if (val === null || val === undefined || val === "") return null;
  const n = parseInt(val, 10);
  return Number.isFinite(n) ? n : null;
};

const parsePaymentDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
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

    const userExists = await prisma.user.findUnique({
      where: { id: String(session.id) },
      select: { id: true },
    });
    if (!userExists) {
      return res.status(401).json({ message: "invalid_session_user" });
    }

    const { id: idParam } = req.query;
    const pelangganIdParam = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!pelangganIdParam || typeof pelangganIdParam !== "string" || pelangganIdParam.trim().length === 0) {
      return res.status(400).json({ message: "invalid_id" });
    }
    const pelangganId = pelangganIdParam.trim();

    const pelanggan = await prisma.masterDataPelanggan.findUnique({
      where: { id: pelangganId },
      select: { id: true, name: true, installationBill: true },
    });
    if (!pelanggan) {
      return res.status(404).json({ message: "pelanggan_not_found" });
    }

    const existingPayments = await prisma.pamPemasangan.findMany({
      where: { pelangganId },
      select: { id: true },
    });
    if (!existingPayments.length) {
      return res.status(404).json({ message: "pam_pemasangan_not_found" });
    }

    const { pelangganId: bodyPelangganId, credit_payments } = req.body || {};
    if (bodyPelangganId) {
      const normalizedBodyId = typeof bodyPelangganId === "string" ? bodyPelangganId.trim() : String(bodyPelangganId);
      if (normalizedBodyId && normalizedBodyId !== pelangganId) {
        return res.status(400).json({ message: "pelanggan_id_mismatch" });
      }
    }

    const paymentsSource = Array.isArray(credit_payments)
      ? credit_payments
      : Array.isArray(req.body)
        ? req.body
        : [];

    if (!paymentsSource.length) {
      return res.status(400).json({ message: "invalid_credit_payments" });
    }

    const sanitizedPayments = [];
    for (let idx = 0; idx < paymentsSource.length; idx += 1) {
      const entry = paymentsSource[idx] ?? {};
      const dateVal = parsePaymentDate(entry.paymentDate ?? entry.date);
      if (!dateVal) {
        return res.status(400).json({ message: "invalid_paymentDate", index: idx });
      }

      const amountVal = toIntOrNull(entry.paidAmount ?? entry.amount);
      if (amountVal === null || amountVal < 0) {
        return res.status(400).json({ message: "invalid_paidAmount", index: idx });
      }

      const notesVal = typeof entry.notes === "string" ? entry.notes : "";
      sanitizedPayments.push({ date: dateVal, amount: amountVal, notes: notesVal });
    }

    const seenDates = new Set();
    for (let idx = 0; idx < sanitizedPayments.length; idx += 1) {
      const key = sanitizedPayments[idx].date.getTime();
      if (seenDates.has(key)) {
        return res.status(400).json({ message: "duplicate_payment_date", index: idx });
      }
      seenDates.add(key);
    }

    const updatedRecords = await prisma.$transaction(async (tx) => {
      await tx.pamPemasangan.deleteMany({ where: { pelangganId } });
      const created = await Promise.all(
        sanitizedPayments.map((payment) =>
          tx.pamPemasangan.create({
            data: {
              pelangganId,
              date: payment.date,
              amount: payment.amount,
              notes: payment.notes,
            },
          })
        )
      );
      return created;
    });

    const totalPaid = updatedRecords.reduce((sum, record) => sum + record.amount, 0);
    const installationBill = pelanggan.installationBill ?? 0;
    const responsePayload = updatedRecords.map((record) => ({
      id: record.id,
      pelangganId: record.pelangganId,
      pelangganName: pelanggan.name ?? null,
      date: record.date.toISOString(),
      amount: record.amount,
      notes: record.notes,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    }));

    return res.status(200).json({
      status: 200,
      message: "pam_pemasangan_updated",
      data: responsePayload,
      meta: {
        pelangganId,
        pelangganName: pelanggan.name ?? null,
        installationBill,
        totalPaid,
        billsToPay: installationBill - totalPaid,
      },
    });
  } catch (error) {
    console.error("UPDATE PAM PEMASANGAN ERROR:", error);
    return res.status(500).json({ message: "server_error" });
  }
}
