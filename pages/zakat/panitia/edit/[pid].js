import RootLayout from '@/components/layouts/RootLayout'
import Form from '@/containers/zakat/panitia/form/Form'
import { getDetailPanitiaZakat } from '@/store/actions/panitiaZakat.action'
import { useRouter } from 'next/router'
import React from 'react'
import { useDispatch } from 'react-redux'

function Index() {
  const router = useRouter();
  const { pid } = router.query;
  const dispatch = useDispatch();

  const breadcrumbs = [
    { label: 'Zakat', href: '/zakat', disabled: true },
    { label: 'Panitia Zakat', href: '/zakat/panitia' },
    { label: 'Edit Data Panitia', href: `/zakat/panitia/edit/${pid}` },
  ]

  async function fetchData() {
    await dispatch(getDetailPanitiaZakat({ id: pid }));
  }

  React.useEffect(() => {
    if (!pid) {
      router.replace('/zakat/panitia');
    } else {
      fetchData();
    }
  }, [pid, router]);

  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <div className='mb-8'>
        <div className='title text-[20px] font-bold text-[#333]'>Edit Data Panitia Zakat</div>
        <div className='text-[13px] text-gray-400'>Perbarui data panitia zakat yang dipilih.</div>
      </div>
      <Form isEdit />
    </RootLayout>
  )
}

export default Index
