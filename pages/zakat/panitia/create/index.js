import RootLayout from '@/components/layouts/RootLayout'
import Form from '@/containers/zakat/panitia/form'
import React from 'react'

function Index() {
  const breadcrumbs = [
    { label: 'Zakat', href: '/zakat', disabled: true },
    { label: 'Panitia Zakat', href: '/zakat/panitia' },
    { label: 'Input Data Panitia', href: '/zakat/panitia/create' },
  ]

  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <div className='mb-8'>
        <div className='title text-[20px] font-bold text-[#333]'>Input Data Panitia Zakat</div>
        <div className='text-[13px] text-gray-400'>Lengkapi data panitia zakat dengan benar.</div>
      </div>
      <Form />
    </RootLayout>
  )
}

export default Index
