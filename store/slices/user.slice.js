import { createSlice, current } from "@reduxjs/toolkit"
import { createUser, getDetailUser, deleteUser, getCurrentUser, getUsers, updateUser } from "../actions/user.action"

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

const userSlice = createSlice({
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
      state.data = actions.payload.data;
      state.meta = actions.payload.meta;
    })
    .addCase(getUsers.rejected, (state) => {
      state.isLoading = false
    })
    
    .addCase(getDetailUser.pending, (state) => {
      state.isLoadingDetail = true
    })
    .addCase(getDetailUser.fulfilled, (state, actions) => {
      state.isLoadingDetail = false;
      state.detail = actions.payload.data;
    })
    .addCase(getDetailUser.rejected, (state) => {
      state.isLoadingDetail = false
    })
    
    .addCase(deleteUser.pending, (state) => {
      state.isLoadingDelete = true
    })
    .addCase(deleteUser.fulfilled, (state, actions) => {
      state.isLoadingDelete = false;
    })
    .addCase(deleteUser.rejected, (state) => {
      state.isLoadingDelete = false
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
    
    .addCase(updateUser.pending, (state) => {
      state.isLoadingCreate = true
    })
    .addCase(updateUser.fulfilled, (state, actions) => {
      state.isLoadingCreate = false;
    })
    .addCase(updateUser.rejected, (state) => {
      state.isLoadingCreate = false
    })
  }
})

export default userSlice.reducer