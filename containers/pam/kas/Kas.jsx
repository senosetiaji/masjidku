import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react'
import Table from './table/Table';

function Kas({ fetchData, params, setParams }) {
  const router = useRouter();
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="title text-[20px] font-bold text-[#333]">Laporan Keuangan</div>
        <Button variant="contained" color="primary" onClick={() => router.push('/pam/kas/create')}>
          Input Data Keuangan
        </Button>
      </div>
      <div className="">
        <Table params={params} setParams={setParams} fetchData={fetchData} />
      </div>
    </div>
  )
}

export default Kas