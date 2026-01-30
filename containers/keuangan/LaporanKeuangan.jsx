import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react'
import Table from './table/Table';
import { formatRupiah } from '@/lib/helpers/helper';
import { useSelector } from 'react-redux';

function LaporanKeuangan({ fetchData, params, setParams }) {
  const router = useRouter();
  const { totalSaldo } = useSelector(state => state.finance);
  return (
    <div>
      <div className="rounded-xl border border-gray-300 mb-8 p-4 flex flex-col items-end gap-4">
        <div className="text-lg font-semibold">Total Saldo: </div>
        <div className="text-2xl font-bold text-green-600">{formatRupiah(totalSaldo)}</div>
      </div>
      <div className="">
        <Table params={params} setParams={setParams} fetchData={fetchData} />
      </div>
    </div>
  )
}

export default LaporanKeuangan