import { createSlice, current } from "@reduxjs/toolkit"
import { getPamRutinan } from "../actions/pam.action"

export const initialState = {
	data:[],
  rutinan:[],
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

const pamSlice = createSlice({
	name:"pam",
	initialState:initialState,
  reducers:{},
  extraReducers:(builder) => {
    builder
    
    .addCase(getPamRutinan.pending, (state) => {
      state.isLoading = true
    })
    .addCase(getPamRutinan.fulfilled, (state, actions) => {
      state.isLoading = false;
      state.rutinan = actions.payload.data;
      state.meta = actions.payload.meta;
    })
    .addCase(getPamRutinan.rejected, (state) => {
      state.isLoading = false
    })
    
    // .addCase(getDetail.pending, (state) => {
    //   state.isLoadingDetail = true
    // })
    // .addCase(getDetail.fulfilled, (state, actions) => {
    //   state.isLoadingDetail = false;
    //   state.detail = actions.payload.data;
    // })
    // .addCase(getDetail.rejected, (state) => {
    //   state.isLoadingDetail = false
    // })
    
    // .addCase(deleteData.pending, (state) => {
    //   state.isLoadingDelete = true
    // })
    // .addCase(deleteData.fulfilled, (state, actions) => {
    //   state.isLoadingDelete = false;
    // })
    // .addCase(deleteData.rejected, (state) => {
    //   state.isLoadingDelete = false
    // })
    
    // .addCase(createFinance.pending, (state) => {
    //   state.isLoadingCreate = true
    // })
    // .addCase(createFinance.fulfilled, (state, actions) => {
    //   state.isLoadingCreate = false;
    // })
    // .addCase(createFinance.rejected, (state) => {
    //   state.isLoadingCreate = false
    // })
    
    // .addCase(updateDataFinance.pending, (state) => {
    //   state.isLoadingCreate = true
    // })
    // .addCase(updateDataFinance.fulfilled, (state, actions) => {
    //   state.isLoadingCreate = false;
    // })
    // .addCase(updateDataFinance.rejected, (state) => {
    //   state.isLoadingCreate = false
    // })
  }
})

export default pamSlice.reducer