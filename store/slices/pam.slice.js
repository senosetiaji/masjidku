import { createSlice, current } from "@reduxjs/toolkit"
import { createPamRutinan, getDetailPamRutin, getPamRutinan, getPamSummary, getPreviousUsed, updateDataPamRutin } from "../actions/pam.action"

export const initialState = {
	data:[],
  rutinan:[],
	detailRutinan:null,
  summaryPam:{},
  previousUsed:null,
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
    
    .addCase(getPreviousUsed.pending, (state) => {
      state.isLoading = true
    })
    .addCase(getPreviousUsed.fulfilled, (state, actions) => {
      state.isLoading = false;
      state.previousUsed = actions.payload.data;
      state.meta = actions.payload.meta;
    })
    .addCase(getPreviousUsed.rejected, (state) => {
      state.isLoading = false
    })
    
    .addCase(getPamSummary.pending, (state) => {
      state.isLoading = true
    })
    .addCase(getPamSummary.fulfilled, (state, actions) => {
      state.isLoading = false;
      state.summaryPam = actions.payload.data;
      state.meta = actions.payload.meta;
    })
    .addCase(getPamSummary.rejected, (state) => {
      state.isLoading = false
    })
    
    .addCase(getDetailPamRutin.pending, (state) => {
      state.isLoadingDetail = true
    })
    .addCase(getDetailPamRutin.fulfilled, (state, actions) => {
      state.isLoadingDetail = false;
      state.detailRutinan = actions.payload.data;
    })
    .addCase(getDetailPamRutin.rejected, (state) => {
      state.isLoadingDetail = false
    })
    
    // .addCase(deleteData.pending, (state) => {
    //   state.isLoadingDelete = true
    // })
    // .addCase(deleteData.fulfilled, (state, actions) => {
    //   state.isLoadingDelete = false;
    // })
    // .addCase(deleteData.rejected, (state) => {
    //   state.isLoadingDelete = false
    // })
    
    .addCase(createPamRutinan.pending, (state) => {
      state.isLoadingCreate = true
    })
    .addCase(createPamRutinan.fulfilled, (state, actions) => {
      state.isLoadingCreate = false;
    })
    .addCase(createPamRutinan.rejected, (state) => {
      state.isLoadingCreate = false
    })
    
    .addCase(updateDataPamRutin.pending, (state) => {
      state.isLoadingCreate = true
    })
    .addCase(updateDataPamRutin.fulfilled, (state, actions) => {
      state.isLoadingCreate = false;
    })
    .addCase(updateDataPamRutin.rejected, (state) => {
      state.isLoadingCreate = false
    })
  }
})

export default pamSlice.reducer