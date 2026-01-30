import RootLayout from '@/components/layouts/RootLayout'
import PelangganPam from '@/containers/master-data/pelanggan-pam/PelangganPam'
import Takmeer from '@/containers/takmeer/Takmeer'
import React from 'react'

function Index() {
  const breadcrumb = [
    {
      label: 'Master Data',
      alias: 'master-data',
      link: '/master-data',
      isDisabled: true
    },
    {
      label: 'Pelanggan PAM',
      alias: 'pelanggan-pam',
      link: '/master-data/pelanggan-pam',
      isDisabled: false
    },
  ]
  return (
    <RootLayout breadcrumbs={breadcrumb}>
      <PelangganPam />
    </RootLayout>
  )
}

export default Index
