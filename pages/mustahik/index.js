import Filter from '@/components/filters/Filter'
import RootLayout from '@/components/layouts/RootLayout'
import ModalDuplicateMustahik from '@/components/modals/ModalDuplicateMustahik'
import Mustahik from '@/containers/mustahik/Mustahik'
import { duplicateMustahik, exportMustahik, getAllMustahik } from '@/store/actions/mustahik.action'
import { Button } from '@mui/material'
import moment from 'moment'
import { useRouter } from 'next/router'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

function Index() {
	const dispatch = useDispatch();
	const router = useRouter();
	const duplicateModalRef = React.useRef();
	const { isLoadingDuplicate, isLoadingExport } = useSelector((state) => state.mustahik);

	const [selectedFilter, setSelectedFilter] = React.useState({
		tahun: { label: moment().year().toString(), value: moment().year().toString() },
		kategori: '',
	});

	const [params, setParams] = React.useState({
		page: 1,
		limit: 10,
		search: '',
	});

	const breadcrumbs = [
		{ label: 'Mustahik', href: '/mustahik', disabled: true },
		{ label: 'Data Mustahik', href: '/mustahik' },
	]

	async function fetchData() {
		await dispatch(getAllMustahik({ params }));
	}

	React.useEffect(() => {
		if (!params?.receivingYear) return;
		fetchData();
	}, [params]);

	React.useEffect(() => {
		setParams((prev) => {
			const next = { ...prev };
			if (selectedFilter.tahun) {
				next.receivingYear = selectedFilter.tahun.value;
			} else {
				delete next.receivingYear;
			}

			if (selectedFilter.kategori) {
				next.role = selectedFilter.kategori.value;
			} else {
				delete next.role;
			}

			next.page = 1;
			return next;
		});
	}, [selectedFilter]);

	const handleDuplicate = async ({ fromYear, toYear, onSuccess }) => {
		const result = await dispatch(duplicateMustahik({ payload: { fromYear, toYear } }));
		if (!duplicateMustahik.rejected.match(result)) {
			await fetchData();
			onSuccess?.();
		}
	};

	const handleExport = async () => {
		await dispatch(exportMustahik({ params }));
	};

	return (
		<RootLayout breadcrumbs={breadcrumbs}>
			<div className="flex justify-between items-center mb-8">
				<div className="title text-[20px] font-bold text-[#333]">Data Mustahik</div>
				<div className="flex gap-3">
					<Button variant="contained" color="inherit" onClick={handleExport} disabled={isLoadingExport}>
						{isLoadingExport ? 'Exporting...' : 'Export PDF'}
					</Button>
					<Button variant="contained" color="secondary" onClick={() => duplicateModalRef.current?.open()}>
						Duplicate Data Mustahik
					</Button>
					<Button variant="contained" color="primary" onClick={() => router.push('/mustahik/create')}>
						Input Data Mustahik
					</Button>
				</div>
			</div>
				<Filter
					filters={[ 'tahun', 'kategori' ]}
					filterState={selectedFilter}
					onSubmit={setSelectedFilter}
					requiredField={[ 'tahun' ]}
					keyName={'mustahik'}
				/>
			<Mustahik params={params} setParams={setParams} fetchData={fetchData} />
			<ModalDuplicateMustahik
				ref={duplicateModalRef}
				loading={isLoadingDuplicate}
				onSubmit={handleDuplicate}
			/>
		</RootLayout>
	)
}

export default Index
