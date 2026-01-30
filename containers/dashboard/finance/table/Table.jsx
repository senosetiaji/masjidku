import TableDashboard from '@/components/table/TableDashboard';
import TableNormal from '@/components/table/TableNormal'
import { __renderValue, formatRupiah } from '@/lib/helpers/helper';
import moment from 'moment';
import React from 'react'
import { useSelector } from 'react-redux';

function Table() {
  const { finance } = useSelector(state => state.dashboard);
  const { data, isLoading, meta } = finance;
  const columns = [
    {
      label:"No",
      align:"center",
      sx: {
        maxWidth: 50,
      },
      render: (val, index) => index + 1,
    },
    {
      label:"Tanggal",
      align:"center",
      sx: {
        minWidth: 200,
      },
      render: (val) => val?.date ? moment(val?.date).format('DD MMM YYYY') : '-'
    },
    {
      label:"Jumlah (Rp.)",
      align:"right",
      sx: {
        minWidth: 150,
      },
      render: (val) => formatRupiah(val?.amount, { zeroAsDash: true })
    },
    {
      label:"Tipe",
      align:"center",
      sx: {
        minWidth: 350,
      },
      render: (val) => {
        if(val?.type === 'income') return <div className="text-emerald-600 font-bold uppercase">Pemasukan</div>
        return (
          <div className="text-yellow-500 font-bold uppercase">Pengeluaran</div>
        )
      }
    },
    {
      label:"Keterangan",
      align:"left",
      sx: {
        minWidth: 350,
      },
      render: (val) => __renderValue(val?.description)
    },
  ]

  return (
    <div className='w-full max-h-80 overflow-auto'>
      <TableDashboard
        columns={columns}
        data={data}
        isLoading={isLoading}
      />
    </div>
  )
}

export default Table