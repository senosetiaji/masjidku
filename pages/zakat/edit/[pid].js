import RootLayout from '@/components/layouts/RootLayout';
import Form from '@/containers/zakat/form';
import { getDetailZakat } from '@/store/actions/zakat.action';
import { useRouter } from 'next/router';
import React from 'react'
import { useDispatch } from 'react-redux';

function Index() {
	const router = useRouter();
	const { pid } = router.query;
	const dispatch = useDispatch();

	const breadcrumbs = [
		{ label: 'Zakat', href: '/zakat' },
		{ label: 'Edit Data Zakat', href: `/zakat/edit/${pid}` },
	];

	async function fetchData() {
		await dispatch(getDetailZakat({ id: pid }));
	}

	React.useEffect(() => {
		if (!pid) {
			router.replace('/zakat');
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
