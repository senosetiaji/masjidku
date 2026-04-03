import RootLayout from '@/components/layouts/RootLayout'
import Roles from '@/containers/roles'
import React from 'react'

function Index() {
  const breadcrumb = [
    {
      label: 'Master Data',
      alias: 'master-data',
      link: '/settings',
      isDisabled: true,
    },
    {
      label: 'Roles',
      alias: 'roles',
      link: '/settings/roles',
      isDisabled: false,
    },
  ]

  return (
    <RootLayout breadcrumbs={breadcrumb}>
      <Roles />
    </RootLayout>
  )
}

export default Index
