import React from 'react'
import Finance from './finance/Finance'
import { useDispatch } from 'react-redux';
import { getDashboardSummary } from '@/store/actions/dashboard.action';
import Summary from './summary/Summary';

function Dashboard() {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(getDashboardSummary({ params: {} }))
  }, [])
  
  return (
    <div>
      <div className="mb-6">
        <Summary />
      </div>
      <Finance />
    </div>
  )
}

export default Dashboard