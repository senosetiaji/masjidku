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

// pam kas actions
export const getPamKas = createAsyncThunk('pamKas/getPamKas', async ({params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/pam/finance/all', { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const getDetailPamKas = createAsyncThunk('pamKas/getDetailPamKas', async ({id, params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get(`/masjidku/pam/finance/${id}/detail`, { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const deleteDataPamKas = createAsyncThunk('pamKas/deleteDataPamKas', async ({id, params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.delete(`/masjidku/pam/finance/${id}/delete`, { params: params })
    const data = await response.data.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const createPamKas = createAsyncThunk('pamKas/createPamKas', async ({payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post('/masjidku/pam/finance/create', payload)
    const data = await response.data.data
    dispatch(successHelper('Pam Kas created successfully', '/pam/kas'))
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const updateDataPamKas = createAsyncThunk('pamKas/updateDataPamKas', async ({id, payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post(`/masjidku/pam/finance/${id}/update`, payload)
    const data = await response.data.data
    dispatch(successHelper('Pam Kas updated successfully', '/pam/kas'))
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

// kas pemasangan

export const getPamPemasangan = createAsyncThunk('pamPemasangan/getPamPemasangan', async ({params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/pam/pemasangan/all', { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const getDetailPamPemasangan = createAsyncThunk('pamPemasangan/getDetailPamPemasangan', async ({id, params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get(`/masjidku/pam/pemasangan/${id}/detail`, { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const deleteDataPamPemasangan = createAsyncThunk('pamPemasangan/deleteDataPamPemasangan', async ({id, params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.delete(`/masjidku/pam/pemasangan/${id}/delete`, { params: params })
    const data = await response.data.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const createPamPemasangan = createAsyncThunk('pamPemasangan/createPamPemasangan', async ({payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post('/masjidku/pam/pemasangan/create', payload)
    const data = await response.data.data
    dispatch(successHelper('Pam Pemasangan created successfully', '/pam/pemasangan'))
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const updateDataPamPemasangan = createAsyncThunk('pamPemasangan/updateDataPamPemasangan', async ({id, payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post(`/masjidku/pam/pemasangan/${id}/update`, payload)
    const data = await response.data.data
    dispatch(successHelper('Pam Pemasangan updated successfully', '/pam/pemasangan'))
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})