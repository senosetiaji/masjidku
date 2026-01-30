import { createSlice, current } from "@reduxjs/toolkit"
import { createInventaris, deleteData, getDetail, getInventaris, updateDataInventaris } from "../actions/inventaris.action"

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

const inventarisSlice = createSlice({
	name:"inventaris",
	initialState:initialState,
  reducers:{},
  extraReducers:(builder) => {
    builder
    
    .addCase(getInventaris.pending, (state) => {
      state.isLoading = true
    })
    .addCase(getInventaris.fulfilled, (state, actions) => {
      state.isLoading = false;
      state.data = actions.payload.data;
      state.meta = actions.payload.meta;
    })
    .addCase(getInventaris.rejected, (state) => {
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
    
    .addCase(createInventaris.pending, (state) => {
      state.isLoadingCreate = true
    })
    .addCase(createInventaris.fulfilled, (state, actions) => {
      state.isLoadingCreate = false;
    })
    .addCase(createInventaris.rejected, (state) => {
      state.isLoadingCreate = false
    })
    
    .addCase(updateDataInventaris.pending, (state) => {
      state.isLoadingCreate = true
    })
    .addCase(updateDataInventaris.fulfilled, (state, actions) => {
      state.isLoadingCreate = false;
    })
    .addCase(updateDataInventaris.rejected, (state) => {
      state.isLoadingCreate = false
    })
  }
})

export default inventarisSlice.reducer