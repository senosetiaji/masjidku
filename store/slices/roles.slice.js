import { createSlice } from "@reduxjs/toolkit";
import { createRole, deleteRole, getRoleDetail, getRoles, updateRole } from "../actions/roles.action";

export const initialState = {
  data: [],
  detail: null,
  meta: {
    current_page: 1,
    per_page: 10,
    total_page: 1,
    total_row: 0,
  },
  isLoading: false,
  isLoadingDetail: false,
  isSubmitting: false,
};

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRoles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload?.data || [];
        state.meta = action.payload?.meta || state.meta;
      })
      .addCase(getRoles.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getRoleDetail.pending, (state) => {
        state.isLoadingDetail = true;
      })
      .addCase(getRoleDetail.fulfilled, (state, action) => {
        state.isLoadingDetail = false;
        state.detail = action.payload?.data || null;
      })
      .addCase(getRoleDetail.rejected, (state) => {
        state.isLoadingDetail = false;
      })
      .addCase(createRole.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(createRole.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(createRole.rejected, (state) => {
        state.isSubmitting = false;
      })
      .addCase(updateRole.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(updateRole.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(updateRole.rejected, (state) => {
        state.isSubmitting = false;
      })
      .addCase(deleteRole.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(deleteRole.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(deleteRole.rejected, (state) => {
        state.isSubmitting = false;
      });
  },
});

export default rolesSlice.reducer;
