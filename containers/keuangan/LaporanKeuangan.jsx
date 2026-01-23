import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react'

function LaporanKeuangan() {
  const router = useRouter();
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="title text-2xl font-bold text-[#333]">Laporan Keuangan</div>
        <Button variant="contained" color="primary" onClick={() => router.push('/keuangan/create')}>
          Input Data Keuangan
        </Button>
      </div>
    </div>
  )
}

export default LaporanKeuangan