import { createSlice, current } from "@reduxjs/toolkit"
import { createPamKas, createPamRutinan, deleteDataPamKas, getDetailPamKas, getDetailPamRutin, getPamKas, getPamRutinan, getPamSummary, getPreviousUsed, updateDataPamKas, updateDataPamRutin } from "../actions/pam.action"

export const initialState = {
	data:[],
  rutinan:[],
	detailRutinan:null,
  summaryPam:{},
  previousUsed:null,
  finance: {
    data: [],
    detail: null,
    meta: {},
  },
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
    // pam kas
    
    .addCase(getPamKas.pending, (state) => {
      state.isLoading = true
    })
    .addCase(getPamKas.fulfilled, (state, actions) => {
      state.isLoading = false;
      state.finance.data = actions.payload.data;
      state.finance.meta = actions.payload.meta;
    })
    .addCase(getPamKas.rejected, (state) => {
      state.isLoading = false
    })
    
    .addCase(getDetailPamKas.pending, (state) => {
      state.isLoadingDetail = true
    })
    .addCase(getDetailPamKas.fulfilled, (state, actions) => {
      state.isLoadingDetail = false;
      state.finance.detail = actions.payload.data;
    })
    .addCase(getDetailPamKas.rejected, (state) => {
      state.isLoadingDetail = false
    })
    
    .addCase(deleteDataPamKas.pending, (state) => {
      state.isLoadingDelete = true
    })
    .addCase(deleteDataPamKas.fulfilled, (state, actions) => {
      state.isLoadingDelete = false;
    })
    .addCase(deleteDataPamKas.rejected, (state) => {
      state.isLoadingDelete = false
    })
    
    .addCase(createPamKas.pending, (state) => {
      state.isLoadingCreate = true
    })
    .addCase(createPamKas.fulfilled, (state, actions) => {
      state.isLoadingCreate = false;
    })
    .addCase(createPamKas.rejected, (state) => {
      state.isLoadingCreate = false
    })
    
    .addCase(updateDataPamKas.pending, (state) => {
      state.isLoadingCreate = true
    })
    .addCase(updateDataPamKas.fulfilled, (state, actions) => {
      state.isLoadingCreate = false;
    })
    .addCase(updateDataPamKas.rejected, (state) => {
      state.isLoadingCreate = false
    })
  }
})

export default pamSlice.reducer