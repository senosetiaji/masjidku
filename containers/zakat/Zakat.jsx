import React from 'react'
import Table from './table'
import SummaryCards from './components'

function Zakat({ params, setParams, fetchData }) {
  return (
    <div>
      <SummaryCards params={params} />
      <Table params={params} setParams={setParams} fetchData={fetchData} />
    </div>
  )
}

export default Zakat
