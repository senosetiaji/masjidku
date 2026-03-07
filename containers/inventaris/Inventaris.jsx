import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react'
import Table from './table';

function Inventaris({ fetchData, params, setParams }) {
  const router = useRouter();
  return (
    <div>
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="title text-[20px] font-bold text-[#333]">Inventaris</div>
        <Button variant="contained" color="primary" onClick={() => router.push('/inventaris/create')} className="w-full sm:w-auto">
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