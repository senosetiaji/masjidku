import RootLayout from '@/components/layouts/RootLayout'
import Form from '@/containers/master-data/pelanggan-pam/form/Form'
import React from 'react'
import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router';

function Index() {
  const router = useRouter();
  const breadcrumb = [
    {
      label: 'Master Data Pelanggan PAM',
      alias: 'master-data-pelanggan-pam',
      link: '/master-data/pelanggan-pam',
      isDisabled: false
    },
    {
      label: 'Create Pelanggan PAM',
      alias: 'create-pelanggan-pam',
      link: '/master-data/pelanggan-pam/create',
      isDisabled: true
    }
  ]
  return (
    <RootLayout breadcrumbs={breadcrumb}>
      <div className="flex items-center mb-6 gap-4">
        <IconButton aria-label="back" onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <div>
          <div className="text-[20px] font-bold text-[#333]">Formulir Data Pelanggan PAM</div>
          <div className="text-[#666] tinos-regular">Lengkapi data pelanggan PAM dengan benar.</div>
        </div>
      </div>
      <Form />
    </RootLayout>
  )
}

export default Index
