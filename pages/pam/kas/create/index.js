import RootLayout from '@/components/layouts/RootLayout'
import Form from '@/containers/pam/kas/form/Form'
import React from 'react'

function Index() {
  const breadcrumbs = [
    { label: 'PAM', href: '/pam', disabled: true },
    { label: 'PAM Kas', href: '/pam/kas', disabled: false },
    { label: 'Input Data Keuangan', href: '/pam/kas/create', disabled: true },
  ]
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <Form />
    </RootLayout>
  )
}

export default Index