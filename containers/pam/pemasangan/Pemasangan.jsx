import React from 'react'
import Table from './table'

function Pemasangan({params, setParams, fetchData}) {
  return (
    <div>
      <Table params={params} setParams={setParams} fetchData={fetchData} />
    </div>
  )
}

export default Pemasangan
