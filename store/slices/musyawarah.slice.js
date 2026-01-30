import { createSlice, current } from "@reduxjs/toolkit"
import { createMusyawarah, deleteData, getAllMusyawarah, getDetail, rangkumMusyawarah, updateDataMusyawarah } from "../actions/musyawarah.action"

export const initialState = {
  data:[],
  detail:null,
  summary:null,
  meta: {
    total_row: 0,
    total_page: 0
  },
  isLoading:false,
  isLoadingCreate:false,
  isLoadingDelete:false,
  isLoadingDetail:false,
}

const musyawarahSlice = createSlice({
  name:"musyawarah",
  initialState:initialState,
  reducers:{},
  extraReducers:(builder) => {
    builder
    
    .addCase(getAllMusyawarah.pending, (state) => {
      state.isLoading = true
    })
    .addCase(getAllMusyawarah.fulfilled, (state, actions) => {
      state.isLoading = false;
      state.data = actions.payload.data;
      state.meta = actions.payload.meta;
    })
    .addCase(getAllMusyawarah.rejected, (state) => {
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
    
    .addCase(createMusyawarah.pending, (state) => {
      state.isLoadingCreate = true
    })
    .addCase(createMusyawarah.fulfilled, (state, actions) => {
      state.isLoadingCreate = false;
    })
    .addCase(createMusyawarah.rejected, (state) => {
      state.isLoadingCreate = false
    })
    
    .addCase(rangkumMusyawarah.pending, (state) => {
      state.isLoadingCreate = true
    })
    .addCase(rangkumMusyawarah.fulfilled, (state, actions) => {
      console.log('RANGKUM FULFILLED ACTIONS:', actions);
      state.isLoadingCreate = false;
      state.summary = actions.payload.data.summary;
    })
    .addCase(rangkumMusyawarah.rejected, (state) => {
      state.isLoadingCreate = false
    })
    
    .addCase(updateDataMusyawarah.pending, (state) => {
      state.isLoadingCreate = true
    })
    .addCase(updateDataMusyawarah.fulfilled, (state, actions) => {
      state.isLoadingCreate = false;
    })
    .addCase(updateDataMusyawarah.rejected, (state) => {
      state.isLoadingCreate = false
    })
  }
})

export default musyawarahSlice.reducer