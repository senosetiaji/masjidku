import RootLayout from '@/components/layouts/RootLayout'
import Inventaris from '@/containers/inventaris/Inventaris';
import { getInventaris } from '@/store/actions/inventaris.action';
import React from 'react'
import { useDispatch } from 'react-redux';

function Index() {
  const dispatch = useDispatch();
  const [params, setParams] = React.useState({
    page: 1,
    limit: 10,
    search: '',
  });
  const breadcrumbs = [
    { label: 'Inventaris', href: '/inventaris/laporan-inventaris', disabled: true },
    { label: 'Laporan Inventaris', href: '/inventaris/laporan-inventaris' },
  ]
  async function fetchData() {
    await dispatch(getInventaris({ params }));
  }
  React.useEffect(() => {
    fetchData();
  }, [params]);
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <Inventaris params={params} setParams={setParams} fetchData={fetchData} />
    </RootLayout>
  )
}

export default Index