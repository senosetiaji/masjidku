import RootLayout from '@/components/layouts/RootLayout';
import Form from '@/containers/zakat/form/Form';
import { IconButton } from '@mui/material';
import React from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router';

function Index() {
  const router = useRouter();
  const breadcrumbs = [
    { label: 'Zakat', href: '/zakat', disabled: true },
    { label: 'Create Zakat', href: '/zakat/create' },
  ]
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <div className="flex items-center mb-6 gap-4">
        <IconButton aria-label="back" onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <div className="flex flex-col">
          <div className="title text-[20px] font-bold text-[#333]">Create Zakat</div>
          <div className='text-[13px] text-gray-400'>Lengkapi data berikut untuk membuat Zakat baru.</div>
        </div>
      </div>
      <Form />
    </RootLayout>
  )
}

export default Index