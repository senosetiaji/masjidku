import SelectBulan from '@/components/forms/SelectBulan'
import SelectYear from '@/components/forms/SelectYear'
import { getFinanceTable, getFinanceChart } from '@/store/actions/dashboard.action'
import { FormControl, IconButton } from '@mui/material'
import React from 'react'
import { useDispatch } from 'react-redux'
import Table from './table/Table'
import moment from 'moment'
import { extractSelect } from '@/lib/helpers/helper'
import Chart from './chart/Chart'
import { useRouter } from 'next/router'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';

function Finance() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [params, setParams] = React.useState({
    year: {label: moment().format('YYYY'), value: moment().format('YYYY')},
    month: null,
  })

  React.useEffect(() => {
    // fetch data when params change
    const newParams = {
      year: extractSelect(params?.year, 'value'),
      month: extractSelect(params?.month, 'value'),
    }

    dispatch(getFinanceChart({ params: newParams }))
  }, [params])

  React.useEffect(() => {
    dispatch(getFinanceTable({ params: {} }))
  }, [])
  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
      <div className="p-4 shadow-md rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Infografis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormControl fullWidth className="">
            <SelectYear
              label="Year"
              value={params.year}
              onChange={(name, value) => setParams({ ...params, year: value })}
              size="small"
            />
          </FormControl>
          <FormControl fullWidth className="">
            <SelectBulan
              label="Month"
              value={params.month}
              onChange={(name, value) => setParams({ ...params, month: value })}
              size="small"
              placeholder="Semua Bulan"
            />
          </FormControl>
          <Chart />
        </div>
      </div>
      <div className="lg:col-span-2 grid grid-cols-1 gap-4">
        <div className="p-4 shadow-md rounded-lg">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Finance (Kas) Overview</h2>
            <IconButton aria-label="" onClick={() => router.push('/keuangan/laporan-keuangan')}>
              <ArrowOutwardIcon className='text-sky-700 hover:text-sky-800' />
            </IconButton>
          </div>
          <div className="text-[13px] mb-4">Ini adalah ringkasan keuangan 10 data terbaru, diambil berdasarkan tahun saat ini.</div>
          <Table />
        </div>
      </div>
    </div>
  )
}

export default Finance