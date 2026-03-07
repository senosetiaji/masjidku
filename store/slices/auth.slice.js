import { createSlice } from "@reduxjs/toolkit"
import { changePassword, loginUser, logout } from "../actions/auth.action"

export const initialState = {
  userSSO: null,
	data:[],
	detail:null,
	detailUser:null,
  meta: {
    total_row: 0,
    total_page: 0
  },
  isLoading:false,
  isLoadingChangePassword:false,
  isLoadingCreate:false,
  isLoadingDelete:false,
  isLoadingDetail:false,
}

const authSlice = createSlice({
	name:"auth",
	initialState:initialState,
  reducers:{},
  extraReducers:(builder) => {
    builder
    
    .addCase(loginUser.pending, (state) => {
      state.isLoading = true
    })
    .addCase(loginUser.fulfilled, (state, actions) => {
      state.isLoading = false
    })
    .addCase(loginUser.rejected, (state) => {
      state.isLoading = false
    })
    
    .addCase(logout.pending, (state) => {
      state.isLoading = true
    })
    .addCase(logout.fulfilled, (state, actions) => {
      state.isLoading = false
    })
    .addCase(logout.rejected, (state) => {
      state.isLoading = false
    })

    .addCase(changePassword.pending, (state) => {
      state.isLoadingChangePassword = true
    })
    .addCase(changePassword.fulfilled, (state) => {
      state.isLoadingChangePassword = false
    })
    .addCase(changePassword.rejected, (state) => {
      state.isLoadingChangePassword = false
    })
  }
})

export default authSlice.reducer