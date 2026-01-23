import Dashboard from '@/containers/dashboard/Dashboard';
import { currentUser, getCurrentUser } from '@/store/actions/user.action';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';

function Index() {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    // React.useEffect(() => {
    //     dispatch(currentUser({params: {}}));
    // }, []);
    React.useEffect(() => {
      if (!currentUser) {
        dispatch(getCurrentUser({params: {}}));
      }
      console.log('currentUser', currentUser);
    }, [currentUser]);
  return (
    <div>
        <Dashboard />
    </div>
  )
}

export default Index