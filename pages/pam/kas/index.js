import Filter from '@/components/filters/Filter';
import RootLayout from '@/components/layouts/RootLayout'
import Kas from '@/containers/pam/kas';
import { exportPamKas, getPamKas } from '@/store/actions/pam.action';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Button from '@mui/material/Button'
import { useRouter } from 'next/router';
import moment from 'moment';

function Index() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoadingExport } = useSelector((state) => state.pam);
  const [params, setParams] = React.useState({
    page: 1,
    limit: 10,
    search: '',
  });
  const [selectedFilter, setSelectedFilter] = React.useState({
    tahun: {label: moment().year().toString(), value: moment().year().toString()},
    bulan: '',
    tipe_transaksi: '',
  });
  const breadcrumbs = [
    { label: 'Keuangan', href: '/pam/kas', disabled: true },
    { label: 'Laporan Kas', href: '/pam/kas' },
  ]
  async function fetchData() {
    await dispatch(getPamKas({ params }));
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

  const handleExport = async () => {
    await dispatch(exportPamKas({ params }));
  };
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="title text-[20px] font-bold text-[#333]">Laporan Keuangan PAM</div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="contained" color="inherit" onClick={handleExport} disabled={isLoadingExport} className="w-full sm:w-auto">
            {isLoadingExport ? 'Exporting...' : 'Export PDF'}
          </Button>
          <Button variant="contained" color="primary" onClick={() => router.push('/pam/kas/create')} className="w-full sm:w-auto">
            Input Data Keuangan
          </Button>
        </div>
      </div>
      <Filter
        filters={['tahun', 'bulan', 'tipe_transaksi']}
        filterState={selectedFilter}
        onSubmit={setSelectedFilter}
        requiredField={['tahun']}
        keyName={'pam_kas'}
      />
      <Kas params={params} setParams={setParams} fetchData={fetchData} />
    </RootLayout>
  )
}

export default Index