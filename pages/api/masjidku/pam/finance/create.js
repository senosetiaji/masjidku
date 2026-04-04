import crypto from "crypto";
import { getTenantPrisma } from "../../../../../lib/helpers/tenantPrisma";
import { saveFinanceReceiptPhotoFromDataUrl } from "../../../../../lib/helpers/financeReceiptImage";

// Prisma singleton (avoid new clients per hot-reload)

const SECRET = process.env.APP_SECRET || "dev-secret";
const VALID_TYPES = new Set(["income", "expense"]);

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

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		const { prisma, tenant } = getTenantPrisma(req);
		// derive user from cookie (set on login)
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

		// normalize user id to string (schema uses String/UUID)
		const userId = String(session.id);

		// ensure user still exists (token could be stale)
		const userExists = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!userExists) {
			return res.status(401).json({ message: "invalid_session_user" });
		}

		const payload = Array.isArray(req.body) ? req.body : [];
		if (!payload.length) {
			return res.status(400).json({ message: "payload_must_be_array" });
		}

		// basic validation & normalization
		const records = [];
		for (const item of payload) {
			const { date, amount, type, description = "", photoDataUrl } = item || {};
			const normalizedType = (type || "").toString().trim().toLowerCase();
			if (!date || typeof amount === "undefined" || amount === null || !type) {
				return res.status(400).json({ message: "missing_fields" });
			}

			if (!VALID_TYPES.has(normalizedType)) {
				return res.status(400).json({ message: "invalid_type" });
			}

			const parsedAmount = Number(amount);
			if (!Number.isFinite(parsedAmount)) {
				return res.status(400).json({ message: "invalid_amount" });
			}

			const parsedDate = new Date(date);
			if (Number.isNaN(parsedDate.getTime())) {
				return res.status(400).json({ message: "invalid_date" });
			}

			records.push({
				date: parsedDate,
				amount: Math.trunc(parsedAmount),
				type: normalizedType,
				description,
				photoDataUrl,
				userId,
			});
		}

		const preparedRecords = [];
		for (const item of records) {
			let photoUrl = null;
			if (item.photoDataUrl) {
				try {
					photoUrl = await saveFinanceReceiptPhotoFromDataUrl({
						dataUrl: item.photoDataUrl,
						tenantKey: tenant.tenantKey,
					});
				} catch (error) {
					return res.status(400).json({ message: "invalid_photo_upload" });
				}
			}

			preparedRecords.push({
				date: item.date,
				amount: item.amount,
				type: item.type,
				description: item.description,
				photoUrl,
				userId: item.userId,
			});
		}

		const created = await prisma.$transaction(
			preparedRecords.map((data) => prisma.pamKas.create({ data }))
		);

		return res.status(201).json({
			status: 201,
			message: "finance_created",
			count: created.length,
		});
	} catch (error) {
		console.error("CREATE FINANCE ERROR:", error);
		// surface known Prisma errors as 400-series
		if (error?.code === "P2003") {
			return res.status(400).json({ message: "foreign_key_constraint_failed" });
		}
		return res.status(500).json({ message: "server_error" });
	}
}
