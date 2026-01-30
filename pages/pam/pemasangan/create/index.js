import RootLayout from '@/components/layouts/RootLayout'
import Form from '@/containers/pam/pemasangan/form/Form'
import React from 'react'

function Index() {
  const breadcrumbs = [
    { label: 'PAM', link: '/pam', isDisabled: true },
    { label: 'Biaya Pemasangan', link: '/pam/pemasangan', isDisabled: true },
    { label: 'Buat Biaya Pemasangan', link: '/pam/pemasangan/create', isDisabled: true },
  ]
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <div>
        <Form />
      </div>
    </RootLayout>
  )
}

export default Index