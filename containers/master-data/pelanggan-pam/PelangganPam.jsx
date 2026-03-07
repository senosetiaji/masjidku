import { useRouter } from 'next/router'
import React from 'react'
import Button from '@mui/material/Button'
import { useDispatch } from 'react-redux';
import { getUsers } from '@/store/actions/user.action';
import Table from './table/Table';
import { getAllPelanggan } from '@/store/actions/master.action';

function PelangganPam() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [params, setParams] = React.useState({
    page: 1,
    limit: 10,
    search: '',
  });

  function fetchData() {
    dispatch(getAllPelanggan({ params: params }));
  }

  React.useEffect(() => {
    fetchData();
  }, [params]);
  return (
    <div>
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="title text-[20px] font-bold text-[#333]">Pelanggan PAM</div>
        <Button variant="contained" color="primary" onClick={() => router.push('/master-data/pelanggan-pam/create')} className="w-full sm:w-auto">
          Daftarkan Pelanggan PAM
        </Button>
      </div>
      {/* Table Component Here */}
      <Table params={params} setParams={setParams} fetchData={fetchData} />
    </div>
  )
}

export default PelangganPam
