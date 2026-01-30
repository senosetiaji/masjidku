import { API } from "@/lib/config/api"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { errorHelper, successHelper } from "./logHelper"

export const getFinance = createAsyncThunk('finance/getFinance', async ({params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/finance/all', { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const getDetail = createAsyncThunk('finance/getDetail', async ({id, params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get(`/masjidku/finance/${id}/detail`, { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const deleteData = createAsyncThunk('finance/deleteData', async ({id, params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.delete(`/masjidku/finance/${id}/delete`, { params: params })
    const data = await response.data.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const createFinance = createAsyncThunk('finance/createFinance', async ({payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post('/masjidku/finance/create', payload)
    const data = await response.data.data
    dispatch(successHelper('Finance created successfully', '/keuangan/laporan-keuangan'))
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const updateDataFinance = createAsyncThunk('finance/updateDataFinance', async ({id, payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post(`/masjidku/finance/${id}/update`, payload)
    const data = await response.data.data
    dispatch(successHelper('Finance updated successfully', '/keuangan/laporan-keuangan'))
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})