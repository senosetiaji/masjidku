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

// export const getDetailUser = createAsyncThunk('user/getDetailUser', async ({id, params}, { dispatch, rejectWithValue }) => {
//   try {
//     const response = await API.get(`/masjidku/user/${id}/detail`, { params: params })
//     const data = await response.data
//     return data
//   } catch(err){
//     dispatch(errorHelper(err))
//     return rejectWithValue(err?.response?.data)
//   }
// })

// export const deleteUser = createAsyncThunk('user/deleteUser', async ({id, params}, { dispatch, rejectWithValue }) => {
//   try {
//     const response = await API.delete(`/masjidku/user/${id}/delete`, { params: params })
//     const data = await response.data.data
//     return data
//   } catch(err){
//     dispatch(errorHelper(err))
//     return rejectWithValue(err?.response?.data)
//   }
// })

export const createFinance = createAsyncThunk('finance/createFinance', async ({payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post('/masjidku/finance/create', payload)
    const data = await response.data.data
    dispatch(successHelper('Profile created successfully', '/keuangan/laporan-keuangan'))
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

// export const updateUser = createAsyncThunk('user/updateUser', async ({id, payload}, { dispatch, rejectWithValue }) => {
//   try {
//     const response = await API.post(`/masjidku/user/${id}/update`, payload)
//     const data = await response.data.data
//     dispatch(successHelper('Profile updated successfully', '/takmeer'))
//     return data
//   } catch(err){
//     dispatch(errorHelper(err))
//     return rejectWithValue(err?.response?.data)
//   }
// })