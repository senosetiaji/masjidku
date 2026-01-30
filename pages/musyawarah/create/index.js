import RootLayout from '@/components/layouts/RootLayout'
import React from 'react'
import Form from '@/containers/musyawarah/form/Form';

function Index() {
  const breadcrumbs = [
    { label: 'Musyawarah', href: '/musyawarah' },
    { label: 'Buat Musyawarah', href: '/musyawarah/create' },
  ]
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <Form isEdit={false} />
    </RootLayout>
  )
}

export default Index
