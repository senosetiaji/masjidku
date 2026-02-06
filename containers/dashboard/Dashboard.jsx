import React from 'react'
import Finance from './finance/Finance'
import { useDispatch } from 'react-redux';
import { getDashboardSummary } from '@/store/actions/dashboard.action';
import Summary from './summary/Summary';
import { Box } from '@mui/material';
import ChartRutin from './pam/ChartRutin';

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
      <Box component={'section'}>
        <Finance />
      </Box>
      <Box component={'section'} sx={{ mt: 4 }}>
        {/* PAM Section can be added here */}
        <ChartRutin />
      </Box>
    </div>
  )
}

export default Dashboard