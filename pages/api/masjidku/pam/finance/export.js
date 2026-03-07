import PDFDocument from "pdfkit";
import crypto from "crypto";
import { getTenantPrisma } from "../../../../../lib/helpers/tenantPrisma";

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

const normalizeQueryValue = (val) => {
	if (Array.isArray(val)) return val[0];
	return val;
};

const formatDate = (value) => {
	const d = new Date(value);
	return new Intl.DateTimeFormat('id-ID', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	}).format(d);
};

export default async function handler(req, res) {
	if (req.method !== "GET") {
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

		const search = (normalizeQueryValue(req.query.search) || "").toString().trim();
		const monthCandidate = parsePositiveInt(normalizeQueryValue(req.query.month ?? req.query.bulan), null);
		const yearCandidate = parsePositiveInt(normalizeQueryValue(req.query.year ?? req.query.tahun), null);
		const typeCandidate = (normalizeQueryValue(req.query.tipe_transaksi ?? req.query.type) || "").toString().trim().toLowerCase();

		let dateFilter = null;
		if (monthCandidate && monthCandidate >= 1 && monthCandidate <= 12 && yearCandidate) {
			const from = new Date(yearCandidate, monthCandidate - 1, 1);
			const to = new Date(yearCandidate, monthCandidate, 1);
			dateFilter = { gte: from, lt: to };
		} else if (yearCandidate) {
			const from = new Date(yearCandidate, 0, 1);
			const to = new Date(yearCandidate + 1, 0, 1);
			dateFilter = { gte: from, lt: to };
		}

		const allowedTypes = ["income", "expense"];
		const typeFilter = allowedTypes.includes(typeCandidate) ? typeCandidate : null;

		const baseWhere = {
			...(search
				? {
						OR: [
							{ description: { contains: search } },
							{ type: { contains: search } },
						],
					}
				: {}),
			...(dateFilter ? { date: dateFilter } : {}),
		};

		const where = {
			...baseWhere,
			...(typeFilter ? { type: typeFilter } : {}),
		};

		const periodStart = dateFilter?.gte ?? null;

		let openingSaldo = 0;
		if (periodStart) {
			const [priorIncome, priorExpense] = await Promise.all([
				prisma.pamKas.aggregate({ where: { date: { lt: periodStart }, type: "income" }, _sum: { amount: true } }),
				prisma.pamKas.aggregate({ where: { date: { lt: periodStart }, type: "expense" }, _sum: { amount: true } }),
			]);
			openingSaldo = (priorIncome._sum.amount || 0) - (priorExpense._sum.amount || 0);
		}

		const [sumIncome, sumExpense, rows] = await Promise.all([
			prisma.pamKas.aggregate({ where: { ...baseWhere, type: "income" }, _sum: { amount: true } }),
			prisma.pamKas.aggregate({ where: { ...baseWhere, type: "expense" }, _sum: { amount: true } }),
			prisma.pamKas.findMany({
				where,
				orderBy: [{ date: "asc" }, { createdAt: "asc" }, { id: "asc" }],
				select: {
					date: true,
					amount: true,
					type: true,
					description: true,
				},
			}),
		]);

		if (!rows.length) {
			return res.status(404).json({ message: "no_data" });
		}

		const incomeSum = sumIncome._sum.amount || 0;
		const expenseSum = sumExpense._sum.amount || 0;
		const firstRowSaldo = rows.length
			? openingSaldo + (rows[0].type === "income" ? rows[0].amount : -rows[0].amount)
			: openingSaldo;
		const closingSaldo = openingSaldo + incomeSum - expenseSum;

		const filenameParts = ["pam-finance"];
		if (yearCandidate) filenameParts.push(yearCandidate);
		if (monthCandidate) filenameParts.push(String(monthCandidate).padStart(2, "0"));
		if (typeFilter) filenameParts.push(typeFilter);
		const filename = `${filenameParts.join("-")}.pdf`;

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

		const doc = new PDFDocument({ margin: 40, size: "A4" });
		doc.pipe(res);

		doc.fontSize(16).text("Laporan Keuangan PAM", { align: "center" });
		doc.moveDown(0.3);
		const metaLines = [];
		metaLines.push(`Tanggal cetak: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`);
		if (yearCandidate) metaLines.push(`Tahun: ${yearCandidate}`);
		if (monthCandidate) metaLines.push(`Bulan: ${monthCandidate}`);
		if (typeFilter) metaLines.push(`Tipe: ${typeFilter}`);
		if (search) metaLines.push(`Pencarian: ${search}`);
		doc.fontSize(10).text(metaLines.join(" | "), { align: "center" });

		doc.moveDown(0.8);
		doc.fontSize(10).text(`Saldo Awal: Rp ${new Intl.NumberFormat("id-ID").format(firstRowSaldo)}`);
		doc.moveDown(0.2);
		doc.text(`Total Pemasukan: Rp ${new Intl.NumberFormat("id-ID").format(incomeSum)}`);
		doc.moveDown(0.2);
		doc.text(`Total Pengeluaran: Rp ${new Intl.NumberFormat("id-ID").format(expenseSum)}`);
		doc.moveDown(0.2);
		doc.text(`Saldo Akhir: Rp ${new Intl.NumberFormat("id-ID").format(closingSaldo)}`);

		doc.moveDown(0.8);
		const headers = ["Tanggal", "Tipe", "Deskripsi", "Jumlah", "Saldo"];
		const colWidths = [90, 60, 190, 80, 80];
		const startX = doc.x;
		let y = doc.y;

		const drawRow = (vals, isHeader = false) => {
			let x = startX;
			const paddingY = 4; // ~2px top/bottom
			const heights = vals.map((text, idx) =>
				doc.heightOfString(String(text), {
					width: colWidths[idx],
					font: isHeader ? "Helvetica-Bold" : "Helvetica",
					fontSize: 9,
				})
			);
			const rowHeight = Math.max(...heights, 12) + paddingY;
			const yText = y + paddingY / 2;
			vals.forEach((text, idx) => {
				doc
					.font(isHeader ? "Helvetica-Bold" : "Helvetica")
					.fontSize(9)
					.text(String(text), x, yText, {
						width: colWidths[idx],
						continued: false,
					});
				x += colWidths[idx];
			});
			y += rowHeight;
			if (y > doc.page.height - 60) {
				doc.addPage();
				y = doc.y;
			}
		};

		drawRow(headers, true);

		let running = openingSaldo;
		rows.forEach((row) => {
			running += row.type === "income" ? row.amount : -row.amount;
			const formattedAmount = new Intl.NumberFormat("id-ID").format(row.amount);
			const formattedSaldo = new Intl.NumberFormat("id-ID").format(running);
			drawRow([
				formatDate(row.date),
				row.type === "income" ? "Pemasukan" : "Pengeluaran",
				row.description || "-",
				formattedAmount,
				formattedSaldo,
			]);
		});

		doc.end();
	} catch (error) {
		console.error("EXPORT PAM FINANCE ERROR:", error);
		return res.status(500).json({ message: "server_error", code: error?.code || null, detail: error?.message || null });
	}
}
