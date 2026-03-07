import { API } from "@/lib/config/api"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { errorHelper, successHelper } from "./logHelper"

export const getSettingsPermissions = createAsyncThunk('settingsPermissions/getSettingsPermissions', async (_, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/settings/permissions')
    const data = await response.data
    return data
  } catch (err) {
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const updateSettingsPermissions = createAsyncThunk('settingsPermissions/updateSettingsPermissions', async ({ payload }, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.put('/masjidku/settings/permissions', payload)
    const data = await response.data
    dispatch(successHelper('Permissions berhasil diperbarui.'))
    return data
  } catch (err) {
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})
