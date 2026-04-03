import Filter from '@/components/filters/Filter';
import RootLayout from '@/components/layouts/RootLayout'
import LaporanKeuangan from '@/containers/keuangan'
import { exportFinance, getFinance } from '@/store/actions/finance.action';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Button from '@mui/material/Button'
import moment from 'moment';
import { useRouter } from 'next/router';
import { useActionPermissionGuard } from '@/lib/hooks/useActionPermissionGuard';

function Index() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { guardAction } = useActionPermissionGuard();
  const { isLoadingExport } = useSelector((state) => state.finance);
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

  const handleExport = async () => {
    await dispatch(exportFinance({ params }));
  }
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="title text-[20px] font-bold text-[#333]">Laporan Keuangan</div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="contained" color="inherit" onClick={handleExport} disabled={isLoadingExport}>
            {isLoadingExport ? 'Exporting...' : 'Export PDF'}
          </Button>
          <Button variant="contained" color="primary" onClick={() => guardAction({ action: 'create', permission: '/keuangan/create', onAllowed: () => router.push('/keuangan/create') })}>
            Input Data Keuangan
          </Button>
        </div>
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