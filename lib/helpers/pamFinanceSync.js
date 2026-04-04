const AUTO_SOURCE_PREFIX = "AUTO_SOURCE";
const AUTO_CUSTOMER_PREFIX = "AUTO_CUSTOMER";

const normalizeMoney = (val) => {
	const n = Number(val);
	if (!Number.isFinite(n)) return 0;
	return Math.trunc(n);
};

const normalizeDate = (val) => {
	if (!val) return new Date();
	const d = new Date(val);
	return Number.isNaN(d.getTime()) ? new Date() : d;
};

const buildAutoSourceTag = (sourceType, sourceId) =>
	`[${AUTO_SOURCE_PREFIX}:${sourceType}:${sourceId}]`;

const buildAutoCustomerTag = (pelangganId) =>
	`[${AUTO_CUSTOMER_PREFIX}:${pelangganId}]`;

const buildRutinanDescription = ({ pelangganName, pelangganId, month, year, sourceTag }) => {
	const customerLabel = pelangganName || pelangganId;
	return `Pemasukan PAM Rutinan - ${customerLabel} (${month}/${year}) ${sourceTag}`;
};

const buildPemasanganDescription = ({ pelangganName, pelangganId, sourceTag, customerTag }) => {
	const customerLabel = pelangganName || pelangganId;
	return `Pemasukan PAM Pemasangan - ${customerLabel} ${sourceTag} ${customerTag}`;
};

export const syncPamKasFromRutinan = async ({ tx, userId, rutinan, pelangganName }) => {
	const sourceTag = buildAutoSourceTag("pam_rutinan", rutinan.id);
	const existingKas = await tx.pamKas.findFirst({
		where: { description: { contains: sourceTag } },
		select: { id: true },
	});

	const amount = normalizeMoney(rutinan.paidAmount);
	if (amount <= 0) {
		if (existingKas?.id) {
			await tx.pamKas.delete({ where: { id: existingKas.id } });
		}
		return;
	}

	const kasData = {
		date: normalizeDate(rutinan.paymentDate),
		type: "income",
		amount,
		description: buildRutinanDescription({
			pelangganName,
			pelangganId: rutinan.pelangganId,
			month: rutinan.month,
			year: rutinan.year,
			sourceTag,
		}),
		userId: String(userId),
	};

	if (existingKas?.id) {
		await tx.pamKas.update({
			where: { id: existingKas.id },
			data: kasData,
		});
		return;
	}

	await tx.pamKas.create({ data: kasData });
};

export const syncPamKasFromPemasanganSet = async ({
	tx,
	userId,
	pelangganId,
	pelangganName,
	payments,
}) => {
	const customerTag = buildAutoCustomerTag(pelangganId);
	await tx.pamKas.deleteMany({
		where: {
			description: {
				contains: customerTag,
			},
		},
	});

	for (const payment of payments) {
		const amount = normalizeMoney(payment.amount);
		if (amount <= 0) continue;

		const sourceTag = buildAutoSourceTag("pam_pemasangan", payment.id);
		await tx.pamKas.create({
			data: {
				date: normalizeDate(payment.date),
				type: "income",
				amount,
				description: buildPemasanganDescription({
					pelangganName,
					pelangganId,
					sourceTag,
					customerTag,
				}),
				userId: String(userId),
			},
		});
	}
};

export const deletePamKasByPemasanganCustomer = async ({ tx, pelangganId }) => {
	const customerTag = buildAutoCustomerTag(pelangganId);
	await tx.pamKas.deleteMany({
		where: {
			description: {
				contains: customerTag,
			},
		},
	});
};
