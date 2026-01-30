import Filter from '@/components/filters/Filter';
import RootLayout from '@/components/layouts/RootLayout'
import LaporanKeuangan from '@/containers/keuangan/LaporanKeuangan'
import { getFinance } from '@/store/actions/finance.action';
import React from 'react'
import { useDispatch } from 'react-redux';
import Button from '@mui/material/Button'
import moment from 'moment';
import { useRouter } from 'next/router';

function Index() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [params, setParams] = React.useState({
    page: 1,
    limit: 10,
    search: '',
    tahun: null,
  });
  const [selectedFilter, setSelectedFilter] = React.useState({
    tahun: '',
    bulan: '',
    tipe_transaksi: '',
  });
  const breadcrumbs = [
    { label: 'Keuangan', href: '/keuangan/laporan-keuangan', disabled: true },
    { label: 'Laporan Keuangan', href: '/keuangan/laporan-keuangan' },
  ]
  async function fetchData() {
    await dispatch(getFinance({ params }));
  }
  React.useEffect(() => {
    if(!params?.tahun) return;
    fetchData();
  }, [params]);
  React.useEffect(() => {
    const newParams = { ...params };
    if (selectedFilter.tahun) {
      newParams.tahun = selectedFilter.tahun.value;
    } else {
      delete newParams.tahun;
    }
    if (selectedFilter.bulan) {
      newParams.bulan = selectedFilter.bulan.value;
    } else {
      delete newParams.bulan;
    }
    if (selectedFilter.tipe_transaksi) {
      newParams.tipe_transaksi = selectedFilter.tipe_transaksi.value;
    } else {
      delete newParams.tipe_transaksi;
    }
    newParams.page = 1;
    setParams(newParams);
  }, [selectedFilter]);
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <div className="flex justify-between items-center mb-8">
        <div className="title text-[20px] font-bold text-[#333]">Laporan Keuangan</div>
        <Button variant="contained" color="primary" onClick={() => router.push('/keuangan/create')}>
          Input Data Keuangan
        </Button>
      </div>
      <Filter
        filters={['tahun', 'bulan', 'tipe_transaksi']}
        filterState={selectedFilter}
        onSubmit={setSelectedFilter}
        requiredField={['tahun']}
        keyName={'kas'}
      />
      <LaporanKeuangan params={params} setParams={setParams} fetchData={fetchData} />
    </RootLayout>
  )
}

export default Index