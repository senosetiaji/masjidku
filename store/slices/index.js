import { combineReducers } from '@reduxjs/toolkit'
// import usersSlice from './usersSlice'
import authReducer from './auth.slice'
import userReducer from './user.slice'

const rootReducer = combineReducers({
  // Add your slice reducers here
  // example: user: userReducer,
  // usersReducer: usersSlice,
  auth: authReducer,
  user: userReducer,
})

export default rootReducer