import TableNormal from '@/components/table/TableNormal'
import ModalConfirm from '@/components/modals/ModalConfirm'
import { dataNotAvailable } from '@/lib/helpers/emptyDataHandler'
import { __renderValue } from '@/lib/helpers/helper'
import { deleteMustahik } from '@/store/actions/mustahik.action'
import { IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment'
import { useRouter } from 'next/router'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActionPermissionGuard } from '@/lib/hooks/useActionPermissionGuard'

function Mustahik({ params, setParams, fetchData }) {
	const dispatch = useDispatch();
	const router = useRouter();
	const deleteModalRef = React.useRef();
	const { data, meta, isLoading } = useSelector((state) => state.mustahik);
	const { guardAction } = useActionPermissionGuard();

	const renderRole = (value) => {
		if (!value) return dataNotAvailable();
		const normalized = String(value).toLowerCase();
		if (normalized === 'warga') return 'Warga';
		if (normalized === 'pemuka agama') return 'Pemuka Agama';
		if (normalized === 'lembaga sosial') return 'Lembaga Sosial';
		return normalized.charAt(0).toUpperCase() + normalized.slice(1);
	}

	const renderZakatType = (value) => {
		if (!value) return dataNotAvailable();
		const normalized = String(value).toLowerCase();
		if (normalized === 'fitrah') return 'Fitrah';
		if (normalized === 'mal') return 'Mal';
		return normalized.charAt(0).toUpperCase() + normalized.slice(1);
	}

	const renderAmount = (value) => {
		const numeric = Number(value);
		if (!Number.isFinite(numeric)) return dataNotAvailable();
		return `${new Intl.NumberFormat('id-ID', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(numeric)} KG`;
	}

	const columns = [
		{
			label: 'No',
			align: 'center',
			sx: { width: 60 },
			render: (val, index) => index + 1 + ((params.page - 1) * params.limit),
		},
		{
			label: 'Nama Penerima',
			align: 'left',
			sx: { minWidth: 220 },
			render: (val) => __renderValue(val.name),
		},
		{
			label: 'Alamat',
			align: 'left',
			sx: { minWidth: 280 },
			render: (val) => __renderValue(val.address),
		},
		{
			label: 'No. Telepon',
			align: 'left',
			sx: { minWidth: 160 },
			render: (val) => __renderValue(val.phone),
		},
		{
			label: 'Kategori',
			align: 'left',
			sx: { minWidth: 180 },
			render: (val) => renderRole(val.role),
		},
		{
			label: 'Jenis Zakat',
			align: 'left',
			sx: { minWidth: 150 },
			render: (val) => renderZakatType(val.zakatType),
		},
		{
			label: 'Jumlah',
			align: 'right',
			sx: { minWidth: 140 },
			render: (val) => renderAmount(val?.amount),
		},
		{
			label: 'Tahun Penerimaan',
			align: 'center',
			sx: { minWidth: 160 },
			render: (val) => val?.receivingYear || dataNotAvailable(),
		},
		{
			label: 'Dibuat',
			align: 'center',
			sx: { minWidth: 140 },
			render: (val) => val?.createdAt ? moment(val.createdAt).format('DD MMM YYYY') : '-',
		},
		{
			label: 'Aksi',
			align: 'center',
			sx: { width: 140 },
			render: (val) => {
				return (
					<div className='flex gap-2 w-full justify-center'>
						<IconButton aria-label="edit" className='bg-yellow-400! text-white! hover:bg-yellow-500!' onClick={() => guardAction({ action: 'update', permission: '/mustahik/edit', onAllowed: () => router.push(`/mustahik/edit/${val?.id}`) })}>
							<EditIcon fontSize="small" />
						</IconButton>
						<IconButton aria-label="delete" className='bg-red-400! text-white! hover:bg-red-500!' onClick={() => guardAction({ action: 'delete', permission: ['/mustahik/delete', '/mustahik/edit'], onAllowed: () => deleteModalRef.current.open(val?.id) })}>
							<DeleteIcon fontSize="small" />
						</IconButton>
					</div>
				)
			}
		},
	]

	async function handleDelete(id) {
		await dispatch(deleteMustahik({ id: id, params: {} }))
		fetchData();
	}

	return (
		<>
			<TableNormal
				columns={columns}
				data={data}
				totalData={meta?.total_row}
				totalPage={meta?.total_page}
				params={params}
				setParams={setParams}
				isLoading={isLoading}
				limit={params.limit}
			/>
			<ModalConfirm ref={deleteModalRef} description="Data yang sudah dihapus tidak dapat dikembalikan." onConfirm={(data) => handleDelete(data)} />
		</>
	)
}

export default Mustahik
