import { API } from "@/lib/config/api"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { errorHelper, successHelper } from "./logHelper"

export const getPamRutinan = createAsyncThunk('pamRutinan/getPamRutinan', async ({params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/pam/rutinan/all', { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const getPamSummary = createAsyncThunk('pamRutinan/getPamSummary', async ({params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/pam/rutinan/summary', { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const getPreviousUsed = createAsyncThunk('pamRutinan/getPreviousUsed', async ({params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/pam/rutinan/previous-used', { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const getDetailPamRutin = createAsyncThunk('pamRutinan/getDetailPamRutin', async ({id, params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get(`/masjidku/pam/rutinan/${id}/detail`, { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

// export const deleteData = createAsyncThunk('pamRutinan/deleteData', async ({id, params}, { dispatch, rejectWithValue }) => {
//   try {
//     const response = await API.delete(`/masjidku/pam/rutinan/${id}/delete`, { params: params })
//     const data = await response.data.data
//     return data
//   } catch(err){
//     dispatch(errorHelper(err))
//     return rejectWithValue(err?.response?.data)
//   }
// })

export const createPamRutinan = createAsyncThunk('pamRutinan/createPamRutinan', async ({payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post('/masjidku/pam/rutinan/create', payload)
    const data = await response.data.data
    dispatch(successHelper('Pam Rutinan created successfully', '/pam/rutinan'))
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const updateDataPamRutin = createAsyncThunk('pamRutinan/updateDataPamRutin', async ({id, payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post(`/masjidku/pam/rutinan/${id}/update`, payload)
    const data = await response.data.data
    dispatch(successHelper('Pam Rutinan updated successfully', '/pam/biaya-rutinan'))
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})