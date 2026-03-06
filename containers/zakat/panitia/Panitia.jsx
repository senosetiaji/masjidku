import React from 'react'
import Table from './table/Table'

function Panitia({ params, setParams, fetchData }) {
  return (
    <div>
      <Table params={params} setParams={setParams} fetchData={fetchData} />
    </div>
  )
}

export default Panitia
