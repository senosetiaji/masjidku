import RootLayout from '@/components/layouts/RootLayout'
import Takmeer from '@/containers/takmeer/Takmeer'
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
      <Takmeer />
    </RootLayout>
  )
}

export default Index
