import RootLayout from '@/components/layouts/RootLayout'
import Form from '@/containers/keuangan/form/Form'
import React from 'react'

function Index() {
  const breadcrumbs = [
    { label: 'Keuangan', href: '/keuangan/laporan-keuangan', disabled: false },
    { label: 'Input Data Keuangan', href: '/keuangan/create', disabled: true },
  ]
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <Form />
    </RootLayout>
  )
}

export default Index