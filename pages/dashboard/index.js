import RootLayout from '@/components/layouts/RootLayout';
import Dashboard from '@/containers/dashboard/Dashboard';
import { currentUser, getCurrentUser } from '@/store/actions/user.action';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';

function Index() {
    
  const breadcrumb = [
    {
      label: 'Dashboard',
      alias: 'dashboard',
      link: '/dashboard',
      isDisabled: false
    },
  ]
  return (
    <RootLayout breadcrumbs={breadcrumb}>      
        <Dashboard />
    </RootLayout>
  )
}

export default Index