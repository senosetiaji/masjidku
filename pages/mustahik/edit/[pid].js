import RootLayout from '@/components/layouts/RootLayout';
import Form from '@/containers/mustahik/form/Form';
import { getDetailMustahik } from '@/store/actions/mustahik.action';
import { useRouter } from 'next/router';
import React from 'react'
import { useDispatch } from 'react-redux';

function Index() {
	const router = useRouter();
	const { pid } = router.query;
	const dispatch = useDispatch();

	const breadcrumbs = [
		{ label: 'Mustahik', href: '/mustahik' },
		{ label: 'Edit Data Mustahik', href: `/mustahik/edit/${pid}` },
	]

	async function fetchData() {
		await dispatch(getDetailMustahik({ id: pid }));
	}

	React.useEffect(() => {
		if (!pid) {
			router.replace('/mustahik');
		} else {
			fetchData();
		}
	}, [pid, router]);

	return (
		<RootLayout breadcrumbs={breadcrumbs}>
			<Form isEdit />
		</RootLayout>
	)
}

export default Index