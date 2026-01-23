import { createSlice, current } from "@reduxjs/toolkit"
import { createUser, getCurrentUser, getUsers } from "../actions/user.action"

export const initialState = {
  userSSO: null,
	data:[],
	detail:null,
	detailUser:null,
    currentUser:null,
  meta: {
    total_row: 0,
    total_page: 0
  },
  isLoading:false,
  isLoadingCreate:false,
  isLoadingDelete:false,
  isLoadingDetail:false,
}

const authSlice = createSlice({
	name:"user",
	initialState:initialState,
  reducers:{},
  extraReducers:(builder) => {
    builder
    
    .addCase(getCurrentUser.pending, (state) => {
      state.isLoading = true
    })
    .addCase(getCurrentUser.fulfilled, (state, actions) => {
      state.isLoading = false;
      state.currentUser = actions.payload;
    })
    .addCase(getCurrentUser.rejected, (state) => {
      state.isLoading = false
    })
    
    .addCase(getUsers.pending, (state) => {
      state.isLoading = true
    })
    .addCase(getUsers.fulfilled, (state, actions) => {
      state.isLoading = false;
      state.data = actions.payload;
      state.meta = actions.meta;
    })
    .addCase(getUsers.rejected, (state) => {
      state.isLoading = false
    })
    
    .addCase(createUser.pending, (state) => {
      state.isLoadingCreate = true
    })
    .addCase(createUser.fulfilled, (state, actions) => {
      state.isLoadingCreate = false;
    })
    .addCase(createUser.rejected, (state) => {
      state.isLoadingCreate = false
    })
  }
})

export default authSlice.reducer