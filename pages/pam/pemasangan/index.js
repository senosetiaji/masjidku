import RootLayout from '@/components/layouts/RootLayout'
import { useRouter } from 'next/router'
import React from 'react'
import Button from '@mui/material/Button'
import { useDispatch } from 'react-redux'
import { getPamPemasangan } from '@/store/actions/pam.action'

function Index() {
  const [params, setParams] = React.useState({
    page: 1,
    limit: 10,
    search: '',
  })
  const router = useRouter();
  const dispatch = useDispatch();

  const breadcrumb = [
    { label: 'PAM', link: '/pam', isDisabled: true },
    { label: 'Pemasangan', link: '/pam/pemasangan', isDisabled: true },
  ]

  React.useEffect(() => {
    dispatch(getPamPemasangan({ params: params }));
  }, [params])
  return (
    <RootLayout breadcrumbs={breadcrumb}>
      <div className="flex justify-between items-center mb-6">
        <div className="title text-[20px] font-bold text-[#333]">Biaya Rutinan</div>
        <Button variant="contained" color="primary"
          onClick={() => router.push({
            pathname: '/pam/pemasangan/create',
          })}>
          Masukan Biaya Pemasangan
        </Button>
      </div>

    </RootLayout>
  )
}

export default Index
