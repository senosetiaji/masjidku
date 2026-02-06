import Filter from '@/components/filters/Filter'
import { getPamChart } from '@/store/actions/dashboard.action'
import moment from 'moment'
import React from 'react'
import { useDispatch } from 'react-redux'
import Chart from './chart/Chart'

function ChartRutin() {
  const dispatch = useDispatch();
  const [params, setParams] = React.useState({
    tahun: null,
    customer_id: null,
  })
  const [filterState, setFilterState] = React.useState({
    tahun: { label: moment().format('YYYY'), value: moment().format('YYYY') },
    pelanggan: null,
  })

  function handleFilterChange(value) {
    setFilterState({
      ...filterState,
      ...value,
    })
  }

  function fetchData() {
    dispatch(getPamChart({ params: params }))
  }

  React.useEffect(() => {
    if(!params?.tahun && !params.customer_id) return;
    fetchData();
  }, [params])

  React.useEffect(() => {
    const updatedParams = {
      tahun: filterState.tahun?.value || '',
      customer_id: filterState.pelanggan?.value || '',
    }
    setParams(updatedParams)
  }, [filterState])

  return (
    <div className="shadow-md rounded-lg border border-slate-100 bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">PAM Rutin</h2>
          <p className="text-xs text-slate-500">Filter untuk menyesuaikan data grafik pemakaian air.</p>
        </div>
      </div>

      <div className="mb-4">
        <Filter
          filters={['tahun', 'pelanggan']}
          filterState={filterState}
          onSubmit={handleFilterChange}
        />
      </div>

      <Chart />
    </div>
  )
}

export default ChartRutin