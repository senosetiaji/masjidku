import RootLayout from '@/components/layouts/RootLayout'
import React from 'react'
import Form from '@/containers/musyawarah/form/Form';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { getDetail } from '@/store/actions/musyawarah.action';

function Index() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { pid } = router.query;
  const breadcrumbs = [
    { label: 'Musyawarah', href: '/musyawarah' },
    { label: 'Edit Musyawarah', href: `/musyawarah/edit/${pid}` },
  ]

  React.useEffect(() => {
    if (pid) {
      // fetch detail musyawarah
      dispatch(getDetail({ id: pid, params: {} }));
    }
  }, [pid]);

  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <Form isEdit={true} />
    </RootLayout>
  )
}

export default Index
