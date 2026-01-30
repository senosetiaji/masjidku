import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react'
import Table from './table/Table';

function Inventaris({ fetchData, params, setParams }) {
  const router = useRouter();
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="title text-[20px] font-bold text-[#333]">Inventaris</div>
        <Button variant="contained" color="primary" onClick={() => router.push('/inventaris/create')}>
          Input Data Inventaris
        </Button>
      </div>
      <div className="">
        <Table params={params} setParams={setParams} fetchData={fetchData} />
      </div>
    </div>
  )
}

export default Inventaris