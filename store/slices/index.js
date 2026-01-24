import { combineReducers } from '@reduxjs/toolkit'
// import usersSlice from './usersSlice'
import authReducer from './auth.slice'
import userReducer from './user.slice'
import modalReducer from './modal.slice'
import financeReducer from './finance.slice'
import inventarisReducer from './inventaris.slice'
import masterReducer from './master.slice'
import filterReducer from './filter.slice'
import pamReducer from './pam.slice'

const rootReducer = combineReducers({
  // Add your slice reducers here
  // example: user: userReducer,
  // usersReducer: usersSlice,
  auth: authReducer,
  user: userReducer,
  modal: modalReducer,
  finance: financeReducer,
  inventaris: inventarisReducer,
  master: masterReducer,
  filter: filterReducer,
  pam: pamReducer,
})

export default rootReducer