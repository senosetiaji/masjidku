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