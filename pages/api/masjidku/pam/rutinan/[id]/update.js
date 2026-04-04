import crypto from "crypto";
import { getTenantPrisma } from "../../../../../../lib/helpers/tenantPrisma";
import {
	deletePamRutinanPhotoIfExists,
	savePamRutinanPhotoFromDataUrl,
} from "../../../../../../lib/helpers/pamRutinanImage";
import { syncPamKasFromRutinan } from "../../../../../../lib/helpers/pamFinanceSync";

// Prisma singleton to avoid multiple connections during hot reload

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

const normalizeStatus = (val) => {
	if (!val) return "";
	const cleaned = val.toString().trim().toLowerCase().replace(/_/g, "-");
	if (["paid", "half-paid", "unpaid"].includes(cleaned)) return cleaned;
	return "";
};

const toIntOrNull = (val) => {
	if (val === null || val === undefined || val === "") return null;
	const n = parseInt(val, 10);
	return Number.isFinite(n) ? n : null;
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

		const userExists = await prisma.user.findUnique({
			where: { id: String(session.id) },
			select: { id: true },
		});

		if (!userExists) {
			return res.status(401).json({ message: "invalid_session_user" });
		}

		const { id: idParam } = req.query;
		const id = Array.isArray(idParam) ? idParam[0] : idParam;
		if (!id || typeof id !== "string" || id.trim().length === 0) {
			return res.status(400).json({ message: "invalid_id" });
		}

		const existing = await prisma.pamRutin.findUnique({
			where: { id: id.trim() },
		});

		if (!existing) {
			return res.status(404).json({ message: "pam_rutinan_not_found" });
		}

		const {
			pelangganId,
			month,
			year,
			previous_used,
			current_used,
			water_bill,
			billAmount,
			paidAmount,
			status,
			notes,
			paymentDate,
			photoDataUrl,
			removePhoto,
		} = req.body || {};

		const monthVal = toIntOrNull(month);
		const yearVal = toIntOrNull(year);
		const prevVal = toIntOrNull(previous_used);
		const currVal = toIntOrNull(current_used);
		const waterVal = toIntOrNull(water_bill);
		const billVal = toIntOrNull(billAmount);
		const paidVal = toIntOrNull(paidAmount);
		const statusVal = normalizeStatus(status);

		const data = {};
		if (pelangganId) data.pelangganId = String(pelangganId);
		if (monthVal !== null) data.month = monthVal;
		if (yearVal !== null) data.year = yearVal;
		if (prevVal !== null) data.previous_used = prevVal;
		if (currVal !== null) data.current_used = currVal;
		if (waterVal !== null) data.water_bill = waterVal;
		if (billVal !== null) data.billAmount = billVal;
		if (paidVal !== null) data.paidAmount = paidVal;
		if (statusVal) data.status = statusVal;
		if (typeof notes === "string") data.notes = notes;
		if (paymentDate !== undefined) {
			data.paymentDate = paymentDate ? new Date(paymentDate) : null;
		}

		if (photoDataUrl) {
			try {
				const newPhotoUrl = await savePamRutinanPhotoFromDataUrl({
					dataUrl: photoDataUrl,
					tenantKey: tenant.tenantKey,
				});

				if (existing.photoUrl) {
					await deletePamRutinanPhotoIfExists(existing.photoUrl);
				}

				data.photoUrl = newPhotoUrl;
			} catch (error) {
				return res.status(400).json({ message: "invalid_photo_upload" });
			}
		} else if (removePhoto === true || removePhoto === "true") {
			if (existing.photoUrl) {
				await deletePamRutinanPhotoIfExists(existing.photoUrl);
			}
			data.photoUrl = null;
		}

		const userId = String(session.id);
		const { updated, pelangganName } = await prisma.$transaction(async (tx) => {
			const updatedRutinan = await tx.pamRutin.update({
				where: { id: id.trim() },
				data,
			});

			let name = null;
			if (updatedRutinan.pelangganId) {
				const pelanggan = await tx.masterDataPelanggan.findUnique({
					where: { id: updatedRutinan.pelangganId },
					select: { name: true },
				});
				name = pelanggan?.name ?? null;
			}

			await syncPamKasFromRutinan({
				tx,
				userId,
				rutinan: updatedRutinan,
				pelangganName: name,
			});

			return { updated: updatedRutinan, pelangganName: name };
		});

		return res.status(200).json({
			status: 200,
			message: "pam_rutinan_updated",
			data: {
				id: updated.id,
				pelangganId: updated.pelangganId,
				pelangganName,
				month: updated.month,
				year: updated.year,
				previous_used: updated.previous_used,
				current_used: updated.current_used,
				water_bill: updated.water_bill,
				billAmount: updated.billAmount,
				paidAmount: updated.paidAmount,
				photoUrl: updated.photoUrl,
				status: updated.status,
				notes: updated.notes,
				paymentDate: updated.paymentDate ? updated.paymentDate.toISOString() : null,
				createdAt: updated.createdAt.toISOString(),
				updatedAt: updated.updatedAt.toISOString(),
			},
		});
	} catch (error) {
		console.error("UPDATE PAM RUTINAN ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
