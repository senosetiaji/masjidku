import RootLayout from '@/components/layouts/RootLayout'
import LaporanKeuangan from '@/containers/keuangan/LaporanKeuangan'
import { getFinance } from '@/store/actions/finance.action';
import React from 'react'
import { useDispatch } from 'react-redux';

function Index() {
  const dispatch = useDispatch();
  const [params, setParams] = React.useState({
    page: 1,
    limit: 10,
    search: '',
  })
  const breadcrumbs = [
    { label: 'Keuangan', href: '/keuangan/laporan-keuangan', disabled: true },
    { label: 'Laporan Keuangan', href: '/keuangan/laporan-keuangan' },
  ]
  async function fetchData() {
    await dispatch(getFinance({ params }));
  }
  React.useEffect(() => {
    fetchData();
  }, [params])
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <LaporanKeuangan params={params} setParams={setParams} fetchData={fetchData} />
    </RootLayout>
  )
}

export default Index