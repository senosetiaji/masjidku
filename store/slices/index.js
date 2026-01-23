import { combineReducers } from '@reduxjs/toolkit'
// import usersSlice from './usersSlice'
import authReducer from './auth.slice'
import userReducer from './user.slice'
import modalReducer from './modal.slice'

const rootReducer = combineReducers({
  // Add your slice reducers here
  // example: user: userReducer,
  // usersReducer: usersSlice,
  auth: authReducer,
  user: userReducer,
  modal: modalReducer,
})

export default rootReducer