import RootLayout from '@/components/layouts/RootLayout'
import { useRouter } from 'next/router'
import React from 'react'
import Button from '@mui/material/Button'
import { useDispatch } from 'react-redux'
import { getPamPemasangan } from '@/store/actions/pam.action'
import Pemasangan from '@/containers/pam/pemasangan'

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

  async function fetchData() {
    await dispatch(getPamPemasangan({ params: params }));
  }

  React.useEffect(() => {
    fetchData();
  }, [params])
  return (
    <RootLayout breadcrumbs={breadcrumb}>
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="title text-[20px] font-bold text-[#333]">Pemasangan PAM</div>
        <Button variant="contained" color="primary"
          className="w-full sm:w-auto"
          onClick={() => router.push({
            pathname: '/pam/pemasangan/create',
          })}>
          Masukan Biaya Pemasangan
        </Button>
      </div>
      <Pemasangan params={params} setParams={setParams} fetchData={fetchData} />
    </RootLayout>
  )
}

export default Index
