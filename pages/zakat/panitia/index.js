import Filter from '@/components/filters/Filter'
import RootLayout from '@/components/layouts/RootLayout'
import Panitia from '@/containers/zakat/panitia'
import { getAllPanitiaZakat } from '@/store/actions/panitiaZakat.action'
import { Button } from '@mui/material'
import moment from 'moment'
import { useRouter } from 'next/router'
import React from 'react'
import { useDispatch } from 'react-redux'
import { useActionPermissionGuard } from '@/lib/hooks/useActionPermissionGuard'

function Index() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { guardAction } = useActionPermissionGuard();

  const [params, setParams] = React.useState({
    page: 1,
    limit: 10,
    search: '',
  });
  const [selectedFilter, setSelectedFilter] = React.useState({
    tahun: { label: moment().year().toString(), value: moment().year().toString() },
  });

  const breadcrumbs = [
    { label: 'Zakat', href: '/zakat', disabled: true },
    { label: 'Panitia Zakat', href: '/zakat/panitia' },
  ]

  async function fetchData() {
    await dispatch(getAllPanitiaZakat({ params }));
  }

  React.useEffect(() => {
    fetchData();
  }, [params]);

  React.useEffect(() => {
    setParams((prev) => {
      const next = { ...prev };
      if (selectedFilter.tahun) {
        next.tahun = selectedFilter.tahun.value;
      } else {
        delete next.tahun;
      }
      next.page = 1;
      return next;
    });
  }, [selectedFilter]);

  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="title text-[20px] font-bold text-[#333]">Data Panitia Zakat</div>
        <Button variant="contained" color="primary" onClick={() => guardAction({ action: 'create', permission: '/zakat/panitia/create', onAllowed: () => router.push('/zakat/panitia/create') })} className="w-full sm:w-auto">
          Input Data Panitia
        </Button>
      </div>
      <Filter
        filters={['tahun']}
        filterState={selectedFilter}
        onSubmit={setSelectedFilter}
        requiredField={['tahun']}
        keyName={'panitia_zakat'}
      />
      <Panitia params={params} setParams={setParams} fetchData={fetchData} />
    </RootLayout>
  )
}

export default Index
