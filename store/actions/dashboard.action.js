import { API } from "@/lib/config/api"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { errorHelper, successHelper } from "./logHelper"

export const getDashboardSummary = createAsyncThunk('dashboard/getDashboardSummary', async ({params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/dashboard/summary', { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const getFinanceTable = createAsyncThunk('dashboard/getFinanceTable', async ({params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/dashboard/finance/table', { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const getFinanceChart = createAsyncThunk('dashboard/getFinanceChart', async ({params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/dashboard/finance/chart', { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const getPamFinanceChart = createAsyncThunk('dashboard/getPamFinanceChart', async ({params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/dashboard/pam/finance', { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})