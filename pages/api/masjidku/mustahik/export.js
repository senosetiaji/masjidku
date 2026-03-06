import { PrismaClient } from "@prisma/client";
import PDFDocument from "pdfkit";
import crypto from "crypto";

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

const normalizeQueryValue = (val) => {
	if (Array.isArray(val)) return val[0];
	return val;
};

export default async function handler(req, res) {
	if (req.method !== "GET") {
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

		const userId = String(session.id);
		const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
		if (!userExists) {
			return res.status(401).json({ message: "invalid_session_user" });
		}

		const search = (normalizeQueryValue(req.query.search) || "").toString().trim();
		const role = (normalizeQueryValue(req.query.role) || "").toString().trim();
		const rawYear = normalizeQueryValue(req.query.receivingYear);
		const receivingYear = rawYear ? Number(rawYear) : null;

		const andConditions = [];
		if (search) {
			andConditions.push({
				OR: [
					{ name: { contains: search } },
					{ address: { contains: search } },
					{ phone: { contains: search } },
					{ role: { contains: search } },
					{ zakatType: { contains: search } },
				],
			});
		}
		if (role) {
			andConditions.push({ role: { contains: role } });
		}
		if (Number.isFinite(receivingYear)) {
			andConditions.push({ receivingYear });
		}

		const where = andConditions.length ? { AND: andConditions } : undefined;

		const rows = await prisma.penerimaZakat.findMany({
			where,
			orderBy: [{ receivingYear: "asc" }, { name: "asc" }],
			select: {
				name: true,
				address: true,
				phone: true,
				role: true,
				zakatType: true,
				amount: true,
				receivingYear: true,
				createdAt: true,
			},
		});

		if (!rows.length) {
			return res.status(404).json({ message: "no_data" });
		}

		const filenameYear = Number.isFinite(receivingYear) ? receivingYear : "all";
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", `attachment; filename="mustahik-${filenameYear}.pdf"`);

		const doc = new PDFDocument({ margin: 40, size: "A4" });
		doc.pipe(res);

		doc.fontSize(16).text("Laporan Data Mustahik", { align: "center" });
		doc.moveDown(0.5);
		const filterLines = [];
		filterLines.push(`Tanggal cetak: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`);
		if (Number.isFinite(receivingYear)) filterLines.push(`Tahun: ${receivingYear}`);
		if (role) filterLines.push(`Kategori: ${role}`);
		if (search) filterLines.push(`Pencarian: ${search}`);
		doc.fontSize(10).text(filterLines.join(" | "), { align: "center" });

		doc.moveDown(1);

		const headers = ["No", "Nama", "Kategori", "Jenis Zakat", "Jumlah", "Tahun", "Telp"];
		const colWidths = [30, 150, 90, 80, 80, 50, 90];
		const startX = doc.x;
		let y = doc.y;

		const drawRow = (vals, isHeader = false) => {
			let x = startX;
			vals.forEach((text, idx) => {
				doc.fontSize(10).font(isHeader ? "Helvetica-Bold" : "Helvetica").text(String(text), x, y, {
					width: colWidths[idx],
					continued: false,
				});
				x += colWidths[idx];
			});
			y += 18;
			// page break handling
			if (y > doc.page.height - 60) {
				doc.addPage();
				y = doc.y;
			}
		};

		drawRow(headers, true);

		rows.forEach((row, idx) => {
			const amount = Number(row.amount);
			const formattedAmount = Number.isFinite(amount)
				? new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
				: "-";
			drawRow([
				idx + 1,
				row.name,
				row.role,
				row.zakatType,
				formattedAmount,
				row.receivingYear,
				row.phone,
			]);
		});

		doc.end();
	} catch (error) {
		console.error("EXPORT MUSTAHIK ERROR:", error);
		return res.status(500).json({ message: "server_error", code: error?.code || null, detail: error?.message || null });
	}
}
