import { createSlice, current } from "@reduxjs/toolkit"
import { createFinance, getFinance } from "../actions/finance.action"

export const initialState = {
	data:[],
	detail:null,
  meta: {
    total_row: 0,
    total_page: 0
  },
  isLoading:false,
  isLoadingCreate:false,
  isLoadingDelete:false,
  isLoadingDetail:false,
}

const financeSlice = createSlice({
	name:"finance",
	initialState:initialState,
  reducers:{},
  extraReducers:(builder) => {
    builder
    
    .addCase(getFinance.pending, (state) => {
      state.isLoading = true
    })
    .addCase(getFinance.fulfilled, (state, actions) => {
      state.isLoading = false;
      state.data = actions.payload.data;
      state.meta = actions.payload.meta;
    })
    .addCase(getFinance.rejected, (state) => {
      state.isLoading = false
    })
    
    // .addCase(getDetailUser.pending, (state) => {
    //   state.isLoadingDetail = true
    // })
    // .addCase(getDetailUser.fulfilled, (state, actions) => {
    //   state.isLoadingDetail = false;
    //   state.detail = actions.payload.data;
    // })
    // .addCase(getDetailUser.rejected, (state) => {
    //   state.isLoadingDetail = false
    // })
    
    // .addCase(deleteUser.pending, (state) => {
    //   state.isLoadingDelete = true
    // })
    // .addCase(deleteUser.fulfilled, (state, actions) => {
    //   state.isLoadingDelete = false;
    // })
    // .addCase(deleteUser.rejected, (state) => {
    //   state.isLoadingDelete = false
    // })
    
    .addCase(createFinance.pending, (state) => {
      state.isLoadingCreate = true
    })
    .addCase(createFinance.fulfilled, (state, actions) => {
      state.isLoadingCreate = false;
    })
    .addCase(createFinance.rejected, (state) => {
      state.isLoadingCreate = false
    })
    
    // .addCase(updateUser.pending, (state) => {
    //   state.isLoadingCreate = true
    // })
    // .addCase(updateUser.fulfilled, (state, actions) => {
    //   state.isLoadingCreate = false;
    // })
    // .addCase(updateUser.rejected, (state) => {
    //   state.isLoadingCreate = false
    // })
  }
})

export default financeSlice.reducer