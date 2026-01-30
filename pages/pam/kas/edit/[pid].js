import RootLayout from '@/components/layouts/RootLayout';
import Form from '@/containers/pam/kas/form/Form';
import { getDetail } from '@/store/actions/finance.action';
import { getDetailPamKas } from '@/store/actions/pam.action';
import { useRouter } from 'next/router';
import React from 'react'
import { useDispatch } from 'react-redux';

function Index() {
  const router = useRouter();
  const { pid } = router.query;
  const dispatch = useDispatch();

  const breadcrumbs = [
    { label: 'PAM', href: '/pam', disabled: true },
    { label: 'PAM Kas', href: '/pam/kas' },
    { label: `Edit Data Keuangan`, href: `/pam/kas/edit/${pid}` },
  ];

  async function fetchData() {
    await dispatch(getDetailPamKas({id: pid}));
  }

  React.useEffect(() => {
    if (!pid) {
      router.replace('/pam/kas');
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