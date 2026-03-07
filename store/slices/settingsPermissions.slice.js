import { createSlice } from "@reduxjs/toolkit"
import { getSettingsPermissions, updateSettingsPermissions } from "../actions/settingsPermissions.action"

export const initialState = {
  roles: [],
  catalog: [],
  rolePermissionsMap: {},
  isLoading: false,
  isSaving: false,
}

const settingsPermissionsSlice = createSlice({
  name: "settingsPermissions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSettingsPermissions.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getSettingsPermissions.fulfilled, (state, action) => {
        state.isLoading = false
        const payloadData = action.payload?.data || {}
        state.roles = payloadData.roles || []
        state.catalog = payloadData.catalog || []
        state.rolePermissionsMap = payloadData.rolePermissions || {}
      })
      .addCase(getSettingsPermissions.rejected, (state) => {
        state.isLoading = false
      })

      .addCase(updateSettingsPermissions.pending, (state) => {
        state.isSaving = true
      })
      .addCase(updateSettingsPermissions.fulfilled, (state, action) => {
        state.isSaving = false
        const roleName = action.payload?.data?.roleName
        const permissions = action.payload?.data?.permissions || []
        if (roleName) {
          state.rolePermissionsMap = {
            ...state.rolePermissionsMap,
            [roleName]: permissions,
          }
        }
      })
      .addCase(updateSettingsPermissions.rejected, (state) => {
        state.isSaving = false
      })
  }
})

export default settingsPermissionsSlice.reducer
