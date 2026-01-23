import RootLayout from '@/components/layouts/RootLayout'
import React from 'react'

function Index() {
  const breadcrumb = [
    {
      label: 'Takmeer',
      alias: 'takmeer',
      link: '/takmeer',
      isDisabled: false
    },
  ]
  return (
    <RootLayout breadcrumbs={breadcrumb}>

    </RootLayout>
  )
}

export default Index
