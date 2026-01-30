import RootLayout from '@/components/layouts/RootLayout';
import Form from '@/containers/keuangan/form/Form';
import { getDetail } from '@/store/actions/finance.action';
import { useRouter } from 'next/router';
import React from 'react'
import { useDispatch } from 'react-redux';

function Index() {
  const router = useRouter();
  const { pid } = router.query;
  const dispatch = useDispatch();

  const breadcrumbs = [
    { label: 'Keuangan', href: '/keuangan' },
    { label: `Edit Data Keuangan`, href: `/keuangan/edit/${pid}` },
  ];

  async function fetchData() {
    await dispatch(getDetail({id: pid}));
  }

  React.useEffect(() => {
    if (!pid) {
      router.replace('/keuangan');
    } else {
      fetchData();
    }

  }, [pid, router]);
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <Form isEdit />
    </RootLayout>
  )
}

export default Index