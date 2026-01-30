import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

// Reuse a single Prisma instance during dev hot-reload
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

const previousMonthYear = () => {
	const now = new Date();
	const dt = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	return { month: dt.getMonth() + 1, year: dt.getFullYear() };
};

const toInt = (val) => Number(val) || 0;

export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		// Auth via HMAC session cookie
		const cookieHeader = req.headers.cookie || "";
		const sessionCookie = cookieHeader.split(";").find((c) => c.trim().startsWith("session="));
		const token = sessionCookie ? sessionCookie.trim().replace("session=", "") : null;
		const session = verifyToken(token);
		if (!session?.id) {
			return res.status(401).json({ message: "unauthorized" });
		}

		const userExists = await prisma.user.findUnique({ where: { id: String(session.id) }, select: { id: true } });
		if (!userExists) {
			return res.status(401).json({ message: "invalid_session_user" });
		}

		const { month: prevMonth, year: prevYear } = previousMonthYear();
		const paidStatuses = ["paid", "half_paid", "half-paid"];

		const [keuanganIncome, keuanganExpense, pamKasIncome, pamKasExpense, pamRutinSum, pamRutinPaidRows, pemasanganSum] =
			await Promise.all([
				prisma.keuangan.aggregate({ where: { type: "income" }, _sum: { amount: true } }),
				prisma.keuangan.aggregate({ where: { type: "expense" }, _sum: { amount: true } }),
				prisma.pamKas.aggregate({ where: { type: "income" }, _sum: { amount: true } }),
				prisma.pamKas.aggregate({ where: { type: "expense" }, _sum: { amount: true } }),
				prisma.pamRutin.aggregate({
					where: { status: { in: paidStatuses }, month: prevMonth, year: prevYear },
					_sum: { paidAmount: true },
				}),
				prisma.pamRutin.groupBy({
					by: ["pelangganId"],
					where: { status: { in: paidStatuses }, month: prevMonth, year: prevYear },
				}),
				prisma.pamPemasangan.groupBy({ by: ["pelangganId"], _sum: { amount: true } }),
			]);

		const pemasanganPelangganIds = pemasanganSum.map((p) => p.pelangganId).filter(Boolean);
		const pelangganMap = pemasanganPelangganIds.length
			? (await prisma.masterDataPelanggan.findMany({
					where: { id: { in: pemasanganPelangganIds } },
					select: { id: true, installationBill: true },
				})).reduce((acc, cur) => {
					acc[cur.id] = cur.installationBill ?? 0;
					return acc;
				}, {})
			: {};

		let totalPenggunaLunas = 0;
		let totalPenggunaBelumLunas = 0;
		let totalBiayaBelumLunas = 0;

		pemasanganSum.forEach((row) => {
			const tagihan = toInt(pelangganMap[row.pelangganId]);
			const sudahBayar = toInt(row._sum?.amount);
			const sisa = tagihan - sudahBayar;
			if (sisa <= 0) {
				totalPenggunaLunas += 1;
			} else {
				totalPenggunaBelumLunas += 1;
				totalBiayaBelumLunas += sisa;
			}
		});

		const saldoKas = toInt(keuanganIncome._sum.amount) - toInt(keuanganExpense._sum.amount);
		const saldoKasPam = toInt(pamKasIncome._sum.amount) - toInt(pamKasExpense._sum.amount);

		const data = {
      saldoKas,
      saldoKasPam,
      pamRutin: {
        total_paid_amount: toInt(pamRutinSum._sum.paidAmount),
        total_paid: pamRutinPaidRows.length,
      },
      pamPemasangan: {
        total_pengguna_lunas: totalPenggunaLunas,
        total_pengguna_blm_lunas: totalPenggunaBelumLunas,
        total_biaya_belum_lunas: totalBiayaBelumLunas,
      },
    };

		return res.status(200).json({
			status: 200,
			message: "dashboard_summary",
			data,
			meta: { bulan: prevMonth, tahun: prevYear },
		});
	} catch (error) {
		console.error("GET DASHBOARD SUMMARY ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
