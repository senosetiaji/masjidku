import RootLayout from '@/components/layouts/RootLayout'
import React from 'react'
import Button from '@mui/material/Button'
import { useRouter } from 'next/router';
import Musyawarah from '@/containers/musyawarah';
import { useDispatch } from 'react-redux';
import { getAllMusyawarah } from '@/store/actions/musyawarah.action';
import { useActionPermissionGuard } from '@/lib/hooks/useActionPermissionGuard';

function Index() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { guardAction } = useActionPermissionGuard();
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
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="title text-[20px] font-bold text-[#333]">Musyawarah</div>
        <Button variant="contained" color="primary"
          className="w-full sm:w-auto"
          onClick={() => guardAction({
            action: 'create',
            permission: '/musyawarah/create',
            onAllowed: () => router.push({
              pathname: '/musyawarah/create',
            }),
          })}>
          Buat Musyawarah
        </Button>
      </div>
      <Musyawarah params={params} setParams={setParams} fetchData={fetchData} />
    </RootLayout>
  )
}

export default Index
