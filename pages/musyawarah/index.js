import RootLayout from '@/components/layouts/RootLayout'
import React from 'react'
import Button from '@mui/material/Button'
import { useRouter } from 'next/router';
import Musyawarah from '@/containers/musyawarah/Musyawarah';
import { useDispatch } from 'react-redux';
import { getAllMusyawarah } from '@/store/actions/musyawarah.action';

function Index() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [params, setParams] = React.useState({
    page:1,
    limit:10,
    search: '',
  });
  const breadcrumbs = [
    { label: 'Musyawarah', href: '/musyawarah' },
  ]

  const fetchData = React.useCallback(() => {
    // dispatch action to get all musyawarah
    dispatch(getAllMusyawarah({ params: params }));
  }, [params]);

  React.useEffect(() => {
    // dispatch action to get all musyawarah
    // dispatch(getAllMusyawarah({ params: { page: 1, limit: 10 } }));
    fetchData();
  }, []);

  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <div className="flex justify-between items-center mb-6">
        <div className="title text-[20px] font-bold text-[#333]">Musyawarah</div>
        <Button variant="contained" color="primary"
          onClick={() => router.push({
            pathname: '/musyawarah/create',
          })}>
          Buat Musyawarah
        </Button>
      </div>
      <Musyawarah params={params} setParams={setParams} fetchData={fetchData} />
    </RootLayout>
  )
}

export default Index
