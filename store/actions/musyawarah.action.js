import { API } from "@/lib/config/api"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { errorHelper, successHelper } from "./logHelper"

export const getAllMusyawarah = createAsyncThunk('musyawarah/getAllMusyawarah', async ({params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/musyawarah/all', { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const rangkumMusyawarah = createAsyncThunk('musyawarah/rangkumMusyawarah', async ({payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post(`/masjidku/musyawarah/summary`, payload)
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const getDetail = createAsyncThunk('musyawarah/getDetail', async ({id, params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get(`/masjidku/musyawarah/${id}/detail`, { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const deleteData = createAsyncThunk('musyawarah/deleteData', async ({id, params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.delete(`/masjidku/musyawarah/${id}/delete`, { params: params })
    const data = await response.data.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const createMusyawarah = createAsyncThunk('musyawarah/createMusyawarah', async ({payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post('/masjidku/musyawarah/create', payload)
    const data = await response.data.data
    dispatch(successHelper('Musyawarah created successfully', '/musyawarah'))
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const updateDataMusyawarah = createAsyncThunk('musyawarah/updateDataMusyawarah', async ({id, payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post(`/masjidku/musyawarah/${id}/update`, payload)
    const data = await response.data.data
    dispatch(successHelper('Musyawarah updated successfully', '/musyawarah'))
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})