import RootLayout from '@/components/layouts/RootLayout';
import Form from '@/containers/mustahik/form/Form';
import React from 'react'

function Index() {
	const breadcrumbs = [
		{ label: 'Mustahik', href: '/mustahik', disabled: true },
		{ label: 'Input Data Mustahik', href: '/mustahik/create' },
	]

	return (
		<RootLayout breadcrumbs={breadcrumbs}>
			<Form />
		</RootLayout>
	)
}

export default Index