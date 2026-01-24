import React from 'react'
import RootLayout from '@/components/layouts/RootLayout'
import Form from '@/containers/inventaris/form/Form'

function Index() {
  const breadcrumbs = [
    { label: 'Inventaris', href: '/inventaris/create', disabled: true },
    { label: 'Tambah Inventaris', href: '/inventaris/create' },
  ]
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <Form />
    </RootLayout>
  )
}

export default Index