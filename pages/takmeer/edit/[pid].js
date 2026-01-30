import React from 'react'
import RootLayout from '@/components/layouts/RootLayout'
import Form from '@/containers/takmeer/form/Form';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { getDetailUser } from '@/store/actions/user.action';

function Index() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { detail } = useSelector(state => state.user);
  const { pid } = router.query;

  const breadcrumb = [
    {
      label: 'Takmeer',
      alias: 'takmeer',
      link: '/takmeer',
      isDisabled: false
    },
    {
      label: 'Formulir Edit',
      alias: 'formulir',
      link: `/takmeer/edit/${pid}`,
      isDisabled: true
    }
  ]

  React.useEffect(() => {
    if (!pid) {
      return;
    }
    dispatch(getDetailUser({ id: pid }));
  }, [pid]);

  return (
    <RootLayout breadcrumbs={breadcrumb}>
      <Form isEdit />
    </RootLayout>
  )
}

export default Index