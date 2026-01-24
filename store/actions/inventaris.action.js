import { API } from "@/lib/config/api"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { errorHelper, successHelper } from "./logHelper"

export const getInventaris = createAsyncThunk('inventaris/getInventaris', async ({params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/inventaris/all', { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const getDetail = createAsyncThunk('inventaris/getDetail', async ({id, params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get(`/masjidku/inventaris/${id}/detail`, { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const deleteData = createAsyncThunk('inventaris/deleteData', async ({id, params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.delete(`/masjidku/inventaris/${id}/delete`, { params: params })
    const data = await response.data.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const createInventaris = createAsyncThunk('inventaris/createInventaris', async ({payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post('/masjidku/inventaris/create', payload)
    const data = await response.data.data
    dispatch(successHelper('Inventaris created successfully', '/inventaris/laporan-inventaris'))
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const updateDataInventaris = createAsyncThunk('inventaris/updateDataInventaris', async ({id, payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post(`/masjidku/inventaris/${id}/update`, payload)
    const data = await response.data.data
    dispatch(successHelper('Inventaris updated successfully', '/inventaris/laporan-inventaris'))
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})