import { API } from "@/lib/config/api"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { errorHelper, successHelper } from "./logHelper"

export const getAllPelanggan = createAsyncThunk('pelanggan/getAllPelanggan', async ({params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/master-data/pelanggan/all', { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

// export const getDetail = createAsyncThunk('pelanggan/getDetail', async ({id, params}, { dispatch, rejectWithValue }) => {
//   try {
//     const response = await API.get(`/masjidku/master-data/pelanggan/${id}/detail`, { params: params })
//     const data = await response.data
//     return data
//   } catch(err){
//     dispatch(errorHelper(err))
//     return rejectWithValue(err?.response?.data)
//   }
// })

// export const deleteData = createAsyncThunk('pelanggan/deleteData', async ({id, params}, { dispatch, rejectWithValue }) => {
//   try {
//     const response = await API.delete(`/masjidku/master-data/pelanggan/${id}/delete`, { params: params })
//     const data = await response.data.data
//     return data
//   } catch(err){
//     dispatch(errorHelper(err))
//     return rejectWithValue(err?.response?.data)
//   }
// })

// export const createPelanggan = createAsyncThunk('pelanggan/createPelanggan', async ({payload}, { dispatch, rejectWithValue }) => {
//   try {
//     const response = await API.post('/masjidku/master-data/pelanggan/create', payload)
//     const data = await response.data.data
//     dispatch(successHelper('Pelanggan created successfully', '/pelanggan/laporan-pelanggan'))
//     return data
//   } catch(err){
//     dispatch(errorHelper(err))
//     return rejectWithValue(err?.response?.data)
//   }
// })

// export const updateDataPelanggan = createAsyncThunk('pelanggan/updateDataPelanggan', async ({id, payload}, { dispatch, rejectWithValue }) => {
//   try {
//     const response = await API.post(`/masjidku/master-data/pelanggan/${id}/update`, payload)
//     const data = await response.data.data
//     dispatch(successHelper('Pelanggan updated successfully', '/pelanggan/laporan-pelanggan'))
//     return data
//   } catch(err){
//     dispatch(errorHelper(err))
//     return rejectWithValue(err?.response?.data)
//   }
// })