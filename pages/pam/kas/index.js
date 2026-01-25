import RootLayout from '@/components/layouts/RootLayout'
import Kas from '@/containers/pam/kas/Kas';
import { getPamKas } from '@/store/actions/pam.action';
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
    { label: 'Keuangan', href: '/pam/kas', disabled: true },
    { label: 'Laporan Kas', href: '/pam/kas' },
  ]
  async function fetchData() {
    await dispatch(getPamKas({ params }));
  }
  React.useEffect(() => {
    fetchData();
  }, [params]);
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <Kas params={params} setParams={setParams} fetchData={fetchData} />
    </RootLayout>
  )
}

export default Index