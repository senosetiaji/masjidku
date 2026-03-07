import { createAsyncThunk } from '@reduxjs/toolkit'
import { API } from '@/lib/config/api'
import { errorHelper } from './logHelper'

export const getShalatProvinsi = createAsyncThunk('shalat/getShalatProvinsi', async (_, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/shalat/provinsi')
    return response.data
  } catch (err) {
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const getShalatKabkota = createAsyncThunk('shalat/getShalatKabkota', async ({ provinsi }, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post('/masjidku/shalat/kabkota', { provinsi })
    return response.data
  } catch (err) {
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const getJadwalShalatBulanan = createAsyncThunk('shalat/getJadwalShalatBulanan', async ({ payload }, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post('/masjidku/shalat', payload)
    return response.data
  } catch (err) {
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})
