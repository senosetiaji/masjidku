import RootLayout from '@/components/layouts/RootLayout'
import Mustahik from '@/containers/mustahik/Mustahik'
import { getAllMustahik } from '@/store/actions/mustahik.action'
import { Button } from '@mui/material'
import { useRouter } from 'next/router'
import React from 'react'
import { useDispatch } from 'react-redux'

function Index() {
	const dispatch = useDispatch();
	const router = useRouter();

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
		fetchData();
	}, [params]);

	return (
		<RootLayout breadcrumbs={breadcrumbs}>
			<div className="flex justify-between items-center mb-8">
				<div className="title text-[20px] font-bold text-[#333]">Data Mustahik</div>
				<Button variant="contained" color="primary" onClick={() => router.push('/mustahik/create')}>
					Input Data Mustahik
				</Button>
			</div>
			<Mustahik params={params} setParams={setParams} fetchData={fetchData} />
		</RootLayout>
	)
}

export default Index
