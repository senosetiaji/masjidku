import RootLayout from '@/components/layouts/RootLayout'
import Form from '@/containers/pam/pemasangan/form/Form'
import { getDetailPamPemasangan, getDetailPamRutin } from '@/store/actions/pam.action';
import { useRouter } from 'next/router';
import React from 'react'
import { useDispatch } from 'react-redux';

function Index() {
  const router = useRouter();
  const { pid } = router.query;
  const dispatch = useDispatch();
  const breadcrumbs = [
    { label: 'PAM', link: '/pam' },
    { label: 'Biaya Rutinan', link: '/pam/biaya-rutinan' },
    { label: 'Edit Biaya Rutinan', link: '/pam/biaya-rutinan/edit' },
  ]

  React.useEffect(() => {
    if (pid) {
      dispatch(getDetailPamPemasangan({ id: pid }) );
    }
  }, [pid]);  
  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <div>
        <Form isEdit={true} />
      </div>
    </RootLayout>
  )
}

export default Index