import { createSlice, current } from "@reduxjs/toolkit"
import { getCurrentUser } from "../actions/user.action"

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
  }
})

export default authSlice.reducer