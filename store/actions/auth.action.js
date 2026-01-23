import { API } from "@/lib/config/api"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { errorHelper, successHelper } from "./logHelper"

export const loginUser = createAsyncThunk('auth/loginUser', async ({payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post('/auth/login', payload)
    const data = await response.data.data
    window.location.href='/dashboard'
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const logout = createAsyncThunk('auth/logout', async ({payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post('/auth/logout', payload)
    const data = await response.data.data
    window.location.href='/'
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})