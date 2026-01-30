import RootLayout from '@/components/layouts/RootLayout'
import Form from '@/containers/pam/biaya-rutinan/form/Form'
import React from 'react'

function Index() {
  const breadcrumbs = [
    { label: 'PAM', link: '/pam' },
    { label: 'Biaya Rutinan', link: '/pam/biaya-rutinan' },
    { label: 'Buat Biaya Rutinan', link: '/pam/biaya-rutinan/create' },
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