import { API } from "@/lib/config/api"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { errorHelper, successHelper } from "./logHelper"

export const getCurrentUser = createAsyncThunk('user/getCurrentUser', async ({payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/user/currentUser', payload)
    const data = await response.data.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const getUsers = createAsyncThunk('user/getUsers', async ({payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/user/users', payload)
    const data = await response.data.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const createUser = createAsyncThunk('user/createUser', async ({payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post('/masjidku/user/create', payload)
    const data = await response.data.data
    dispatch(successHelper('Profile craeted successfully', '/takmeer'))
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})