import Filter from '@/components/filters/Filter';
import RootLayout from '@/components/layouts/RootLayout'
import Zakat from '@/containers/zakat';
import { getAllZakat } from '@/store/actions/zakat.action';
import { Button } from '@mui/material';
import moment from 'moment';
import { useRouter } from 'next/router';
import React from 'react'
import { useDispatch } from 'react-redux';

function Index() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = React.useState({
    tahun: { label: moment().year().toString(), value: moment().year().toString() },
    zakat_type: '',
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
    await dispatch(getAllZakat({ params }));
  }
  React.useEffect(() => {
    if (!params?.tahun) return;
    fetchData();
  }, [params]);
  React.useEffect(() => {
    const newParams = { ...params };
    if (selectedFilter.tahun) {
      newParams.tahun = selectedFilter.tahun.value;
    } else {
      delete newParams.tahun;
    }
    if (selectedFilter.zakat_type) {
      newParams.type = selectedFilter.zakat_type.value;
    } else {
      delete newParams.type;
    }
    newParams.page = 1;
    setParams(newParams);
  }, [selectedFilter]);
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="title text-[20px] font-bold text-[#333]">Laporan Zakat</div>
        <Button variant="contained" color="primary" onClick={() => router.push('/zakat/create')} className="w-full sm:w-auto">
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