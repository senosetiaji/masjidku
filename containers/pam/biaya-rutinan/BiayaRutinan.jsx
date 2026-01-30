import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react'
import Table from './table/Table';
import Summary from './components/Summary';

function BiayaRutinan({ fetchData, params, setParams }) {
  const router = useRouter();
  return (
    <div>
      <Summary params={params} />
      <Table params={params} setParams={setParams} fetchData={fetchData} />
    </div>
  )
}

export default BiayaRutinan