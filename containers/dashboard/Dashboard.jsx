import React from 'react'
import Finance from './finance'
import { useDispatch } from 'react-redux';
import { getDashboardSummary } from '@/store/actions/dashboard.action';
import Summary from './summary';
import { Box } from '@mui/material';
import ChartRutin from './pam';
import ShalatWidget from './shalat';

function Dashboard() {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(getDashboardSummary({ params: {} }))
  }, [])
  
  return (
    <div>
      <Box component={'section'} sx={{ mb: 4 }}>
        <ShalatWidget />
      </Box>
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