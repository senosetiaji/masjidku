import RootLayout from '@/components/layouts/RootLayout'
import React from 'react'
import Button from '@mui/material/Button'
import { useRouter } from 'next/router';

function Index() {
  const router = useRouter();
  const breadcrumbs = [
    { label: 'Musyawarah', href: '/musyawarah' },
  ]
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <div className="flex justify-between items-center mb-6">
        <div className="title text-[20px] font-bold text-[#333]">Musyawarah</div>
        <Button variant="contained" color="primary"
          onClick={() => router.push({
            pathname: '/musyawarah/create',
          })}>
          Buat Musyawarah
        </Button>
      </div>
      
    </RootLayout>
  )
}

export default Index
