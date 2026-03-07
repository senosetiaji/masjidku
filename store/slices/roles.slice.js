import { createSlice } from "@reduxjs/toolkit";
import { getRoles } from "../actions/roles.action";

export const initialState = {
  data: [],
  isLoading: false,
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
      })
      .addCase(getRoles.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default rolesSlice.reducer;
