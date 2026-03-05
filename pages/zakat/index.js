import Filter from '@/components/filters/Filter';
import RootLayout from '@/components/layouts/RootLayout'
import Zakat from '@/containers/zakat/Zakat';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react'
import { useDispatch } from 'react-redux';

function Index() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = React.useState({
    tahun: null,
  })
  const [params, setParams] = React.useState({
    page: 1,
    limit: 10,
    search: '',
  });
  const breadcrumbs = [
    { label: 'Zakat', href: '/zakat', disabled: true },
    { label: 'Laporan Zakat', href: '/zakat' },
  ]
  async function fetchData() {
    // await dispatch(getInventaris({ params }));
  }
  React.useEffect(() => {
    fetchData();
  }, [params]);
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <div className="flex justify-between items-center mb-8">
        <div className="title text-[20px] font-bold text-[#333]">Laporan Zakat</div>
        <Button variant="contained" color="primary" onClick={() => router.push('/zakat/create')}>
          Input Data Zakat
        </Button>
      </div>
      <Filter
        filters={['tahun', 'zakat_type']}
        filterState={selectedFilter}
        onSubmit={setSelectedFilter}
        requiredField={['tahun']}
        keyName={'zakat'}
      />
      <Zakat params={params} setParams={setParams} fetchData={fetchData} />
    </RootLayout>
  )
}

export default Index