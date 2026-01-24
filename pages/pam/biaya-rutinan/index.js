import Filter from '@/components/filters/Filter';
import RootLayout from '@/components/layouts/RootLayout'
import BiayaRutinan from '@/containers/pam/biaya-rutinan/BiayaRutinan';
import { extractSelect } from '@/lib/helpers/helper';
import { getPamRutinan } from '@/store/actions/pam.action';
import { Button } from '@mui/material';
import moment from 'moment';
import { useRouter } from 'next/router';
import React from 'react'
import { useDispatch } from 'react-redux';

function Index() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedFilter, setSelectedFilter] = React.useState({
    tahun: {label: moment().format('YYYY'), value: moment().format('YYYY')},
    bulan: {label: moment().format('MMMM'), value: moment().format('MM')},
  });
  const [params, setParams] = React.useState({
    page: 1,
    limit: 10,
    search: '',
  });
  const breadcrumbs = [
    { label: 'PAM', link: '/pam' },
    { label: 'Biaya Rutinan', link: '/pam/biaya-rutinan' },
  ]

  React.useEffect(() => {
    // Ketika selectedFilter berubah, update params
    setParams(prev => ({
      ...prev,
      tahun: extractSelect(selectedFilter?.tahun, 'value'),
      bulan: extractSelect(selectedFilter?.bulan, 'value'),
      payment_status: extractSelect(selectedFilter?.payment_status, 'value'),
      page: 1, // reset ke halaman 1 saat filter berubah
    }));
  }, [selectedFilter]);

  async function fetchData() {
    await dispatch(getPamRutinan({ params: params }));
  }

  React.useEffect(() => {
    if(!params?.tahun) return;
    fetchData();
  }, [params]);

  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <div className="flex justify-between items-center mb-6">
        <div className="title text-[20px] font-bold text-[#333]">Biaya Rutinan</div>
        <Button variant="contained" color="primary" disabled={!params?.tahun || !params?.bulan} 
          onClick={() => router.push({
            pathname: '/pam/biaya-rutinan/create',
            query: { tahun: extractSelect(params?.tahun, 'value'), bulan: extractSelect(params?.bulan, 'value') || '' }
          })}>
          Input Biaya PAM
        </Button>
      </div>
      <Filter
        filters={['tahun', 'bulan', 'payment_status']}
        filterState={selectedFilter}
        onSubmit={setSelectedFilter}
        requiredField={['tahun']}
        keyName={'pam_rutinan'}
      />
      <BiayaRutinan fetchData={fetchData} params={params} setParams={setParams} />
    </RootLayout>
  )
}

export default Index