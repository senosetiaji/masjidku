import RootLayout from '@/components/layouts/RootLayout';
import Form from '@/containers/inventaris/form/Form';
import { getDetail } from '@/store/actions/inventaris.action';
import { useRouter } from 'next/router';
import React from 'react'
import { useDispatch } from 'react-redux';

function Index() {
  const router = useRouter();
  const { pid } = router.query;
  const dispatch = useDispatch();

  const breadcrumbs = [
    { label: 'Inventaris', href: '/inventaris' },
    { label: `Edit Data Inventaris`, href: `/inventaris/edit/${pid}` },
  ];

  async function fetchData() {
    await dispatch(getDetail({id: pid}));
  }

  React.useEffect(() => {
    if (!pid) {
      router.replace('/inventaris/laporan-inventaris');
    } else {
      fetchData();
    }

  }, [pid, router]);
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <Form isEdit={true} />
    </RootLayout>
  )
}

export default Index