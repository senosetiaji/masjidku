import TextAreaField from '@/components/fields/TextAreaField';
import TextInputField from '@/components/fields/TextInputField';
import SelectField from '@/components/fields/SelectField';
import SelectZakatType from '@/components/forms/SelectZakatType';
import SelectYear from '@/components/forms/SelectYear';
import { extractValue } from '@/lib/helpers/helper';
import { createMustahik, updateMustahik } from '@/store/actions/mustahik.action';
import { Button, FormControl, IconButton } from '@mui/material';
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const roleOptions = [
	{ label: 'Warga', value: 'warga' },
	{ label: 'Pemuka Agama', value: 'pemuka agama' },
	{ label: 'Lembaga Sosial', value: 'lembaga sosial' },
]

function Form({ isEdit = false }) {
	const dispatch = useDispatch();
	const router = useRouter();
	const { pid } = router.query;
	const { isLoadingCreate, detail } = useSelector((state) => state.mustahik);

	const parseAmount = (value) => {
		if (value === undefined || value === null) return 0;
		if (typeof value === 'number') return value;
		const normalized = String(value).replace(/\s+/g, '').replace(',', '.');
		const parsed = Number(normalized);
		return Number.isFinite(parsed) ? parsed : 0;
	}

	const onSubmit = (values) => {
		const receivingYear = extractValue(values.receivingYear, 'value')
		const payload = {
			...values,
			role: extractValue(values.role, 'value'),
			zakatType: extractValue(values.zakatType, 'value'),
			amount: parseAmount(values.amount),
			receivingYear: Number(receivingYear),
		}

		if (isEdit) {
			dispatch(updateMustahik({ id: pid, payload }))
			return;
		}
		dispatch(createMustahik({ payload }))
	}

	const formik = useFormik({
		initialValues: {
			name: '',
			address: '',
			phone: '',
			role: '',
			zakatType: '',
			amount: '',
			receivingYear: '',
		},
		onSubmit,
	});

	React.useEffect(() => {
		if (isEdit && detail) {
			formik.setValues({
				name: detail.name || '',
				address: detail.address || '',
				phone: detail.phone || '',
				role: detail.role ? roleOptions.find((item) => item.value === detail.role) || '' : '',
				zakatType: detail.zakatType
					? { label: detail.zakatType.charAt(0).toUpperCase() + detail.zakatType.slice(1), value: detail.zakatType }
					: '',
				amount: detail.amount !== undefined && detail.amount !== null ? String(detail.amount) : '',
				receivingYear: detail.receivingYear !== undefined && detail.receivingYear !== null
					? { label: String(detail.receivingYear), value: String(detail.receivingYear) }
					: '',
			})
		}
	}, [isEdit, detail])

	return (
		<div>
			<div className="flex items-center mb-6 gap-4">
				<IconButton aria-label="back" onClick={() => router.back()}>
					<ArrowBackIcon />
				</IconButton>
				<div>
					<div className="text-[20px] font-bold text-[#333]">{isEdit ? 'Edit Mustahik' : 'Input Data Mustahik'}</div>
					<div className="text-[#666] text-[13px]">Lengkapi data mustahik dengan benar.</div>
				</div>
			</div>

			<form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormControl fullWidth className='md:col-span-2'>
					<TextInputField
						label="Nama Penerima"
						name="name"
						value={formik.values.name}
						onChange={(name, value) => formik.setFieldValue(name, value)}
						placeholder="Masukkan nama penerima"
						size={'small'}
					/>
				</FormControl>

				<FormControl fullWidth className='md:col-span-2'>
					<TextAreaField
						label="Alamat"
						name="address"
						value={formik.values.address}
						onChange={(name, value) => formik.setFieldValue(name, value)}
						placeholder="Masukkan alamat"
						size={'small'}
					/>
				</FormControl>

				<FormControl fullWidth>
					<TextInputField
						label="Nomor Telepon"
						name="phone"
						value={formik.values.phone}
						onChange={(name, value) => formik.setFieldValue(name, value)}
						placeholder="Masukkan nomor telepon"
						size={'small'}
					/>
				</FormControl>

				<FormControl fullWidth>
					<SelectField
						label="Kategori"
						name="role"
						value={formik.values.role}
						onChange={(name, value) => formik.setFieldValue(name, value)}
						options={roleOptions}
						placeholder="Pilih kategori"
						size={'small'}
					/>
				</FormControl>

				<FormControl fullWidth>
					<SelectZakatType
						label="Jenis Zakat"
						name="zakatType"
						value={formik.values.zakatType}
						onChange={(name, value) => formik.setFieldValue(name, value)}
						placeholder="Pilih jenis zakat"
						size={'small'}
					/>
				</FormControl>

				<FormControl fullWidth>
					<SelectYear
						label="Tahun Penerimaan"
						name="receivingYear"
						value={formik.values.receivingYear}
						onChange={(name, value) => formik.setFieldValue(name, value)}
						placeholder="Pilih tahun penerimaan"
						size={'small'}
					/>
				</FormControl>

				<FormControl fullWidth className='md:col-span-2'>
					<TextInputField
						label="Jumlah"
						name="amount"
						value={formik.values.amount}
						onChange={(name, value) => formik.setFieldValue(name, value)}
						placeholder="Masukkan jumlah"
						size={'small'}
						type="number"
						InputProps={{ inputProps: { step: '0.01', min: '0' } }}
					/>
				</FormControl>

				<div className="md:col-span-2 flex justify-end mt-4">
					<Button type="submit" variant="contained" color="primary" disabled={isLoadingCreate} className="w-full sm:w-auto">
						{isEdit ? 'Simpan Perubahan' : 'Simpan Mustahik'}
					</Button>
				</div>
			</form>
		</div>
	)
}

export default Form
