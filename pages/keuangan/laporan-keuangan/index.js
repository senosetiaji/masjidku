import RootLayout from '@/components/layouts/RootLayout'
import LaporanKeuangan from '@/containers/keuangan/LaporanKeuangan'
import React from 'react'

function Index() {
  const breadcrumbs = [
    { label: 'Keuangan', href: '/keuangan/laporan-keuangan', disabled: true },
    { label: 'Laporan Keuangan', href: '/keuangan/laporan-keuangan' },
  ]
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <LaporanKeuangan />
    </RootLayout>
  )
}

export default Index