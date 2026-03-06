import RootLayout from '@/components/layouts/RootLayout'
import Panitia from '@/containers/zakat/panitia/Panitia'
import { getAllPanitiaZakat } from '@/store/actions/panitiaZakat.action'
import { Button } from '@mui/material'
import { useRouter } from 'next/router'
import React from 'react'
import { useDispatch } from 'react-redux'

function Index() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [params, setParams] = React.useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const breadcrumbs = [
    { label: 'Zakat', href: '/zakat', disabled: true },
    { label: 'Panitia Zakat', href: '/zakat/panitia' },
  ]

  async function fetchData() {
    await dispatch(getAllPanitiaZakat({ params }));
  }

  React.useEffect(() => {
    fetchData();
  }, [params]);

  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <div className="flex justify-between items-center mb-8">
        <div className="title text-[20px] font-bold text-[#333]">Data Panitia Zakat</div>
        <Button variant="contained" color="primary" onClick={() => router.push('/zakat/panitia/create')}>
          Input Data Panitia
        </Button>
      </div>
      <Panitia params={params} setParams={setParams} fetchData={fetchData} />
    </RootLayout>
  )
}

export default Index
