import { useRouter } from 'next/router'
import React from 'react'
import Button from '@mui/material/Button'
import { useDispatch } from 'react-redux';
import { getUsers } from '@/store/actions/user.action';
import Table from './table/Table';

function Takmeer() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [params, setParams] = React.useState({
    page: 1,
    limit: 10,
    search: '',
  });

  React.useEffect(() => {
    dispatch(getUsers({ params: params }));
  }, [params]);
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="title text-2xl font-bold text-[#333]">Takmeer Masjid</div>
        <Button variant="contained" color="primary" onClick={() => router.push('/takmeer/create')}>
          Daftarkan Takmeer
        </Button>
      </div>
      {/* Table Component Here */}
      <Table params={params} setParams={setParams} />
    </div>
  )
}

export default Takmeer
