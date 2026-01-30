import { createSlice, current } from "@reduxjs/toolkit"
import { createFinance, deleteData, getDetail, getFinance, updateDataFinance } from "../actions/finance.action"

export const initialState = {
	data:[],
	detail:null,
  meta: {
    total_row: 0,
    total_page: 0
  },
  totalSaldo:0,
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
      state.totalSaldo = actions.payload.totalSaldo;
      state.meta = actions.payload.meta;
    })
    .addCase(getFinance.rejected, (state) => {
      state.isLoading = false
    })
    
    .addCase(getDetail.pending, (state) => {
      state.isLoadingDetail = true
    })
    .addCase(getDetail.fulfilled, (state, actions) => {
      state.isLoadingDetail = false;
      state.detail = actions.payload.data;
    })
    .addCase(getDetail.rejected, (state) => {
      state.isLoadingDetail = false
    })
    
    .addCase(deleteData.pending, (state) => {
      state.isLoadingDelete = true
    })
    .addCase(deleteData.fulfilled, (state, actions) => {
      state.isLoadingDelete = false;
    })
    .addCase(deleteData.rejected, (state) => {
      state.isLoadingDelete = false
    })
    
    .addCase(createFinance.pending, (state) => {
      state.isLoadingCreate = true
    })
    .addCase(createFinance.fulfilled, (state, actions) => {
      state.isLoadingCreate = false;
    })
    .addCase(createFinance.rejected, (state) => {
      state.isLoadingCreate = false
    })
    
    .addCase(updateDataFinance.pending, (state) => {
      state.isLoadingCreate = true
    })
    .addCase(updateDataFinance.fulfilled, (state, actions) => {
      state.isLoadingCreate = false;
    })
    .addCase(updateDataFinance.rejected, (state) => {
      state.isLoadingCreate = false
    })
  }
})

export default financeSlice.reducer