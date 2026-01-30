import RootLayout from '@/components/layouts/RootLayout'
import Form from '@/containers/takmeer/form/Form'
import React from 'react'

function Index() {
  const breadcrumb = [
    {
      label: 'Takmeer',
      alias: 'takmeer',
      link: '/takmeer',
      isDisabled: false
    },
    {
      label: 'Formulir',
      alias: 'formulir',
      link: '/takmeer/create',
      isDisabled: true
    }
  ]
  return (
    <RootLayout breadcrumbs={breadcrumb}>
      <Form />
    </RootLayout>
  )
}

export default Index
