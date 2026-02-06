import { createSlice, current } from "@reduxjs/toolkit"
import { getDashboardSummary, getFinanceChart, getFinanceTable, getPamChart, getPamFinanceChart } from "../actions/dashboard.action"

export const initialState = {
	data:[],
  finance: {
    data: [],
    chart: null,
    isLoading: false,
    meta: {
      total_row: 0,
      total_page: 0
    },
  },
  pam: {
    data: [],
    chart: null,
    finance: null,
    isLoading: false,
    meta: {
      total_row: 0,
      total_page: 0
    },
  },
  summary: null,
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

const dashboardSlice = createSlice({
	name:"dashboard",
	initialState:initialState,
  reducers:{},
  extraReducers:(builder) => {
    builder
    
    .addCase(getDashboardSummary.pending, (state) => {
      state.isLoading = true
    })
    .addCase(getDashboardSummary.fulfilled, (state, actions) => {
      state.isLoading = false;
      state.summary = actions.payload.data;
    })
    .addCase(getDashboardSummary.rejected, (state) => {
      state.isLoading = false
    })
    
    .addCase(getFinanceTable.pending, (state) => {
      state.finance.isLoading = true
    })
    .addCase(getFinanceTable.fulfilled, (state, actions) => {
      state.finance.isLoading = false;
      state.finance.data = actions.payload.data;
    })
    .addCase(getFinanceTable.rejected, (state) => {
      state.finance.isLoading = false
    })
    
    .addCase(getFinanceChart.pending, (state) => {
      state.finance.isLoading = true
    })
    .addCase(getFinanceChart.fulfilled, (state, actions) => {
      state.finance.isLoading = false;
      state.finance.chart = actions.payload.data;
    })
    .addCase(getFinanceChart.rejected, (state) => {
      state.finance.isLoading = false
    })
    
    .addCase(getPamFinanceChart.pending, (state) => {
      state.pam.isLoading = true
    })
    .addCase(getPamFinanceChart.fulfilled, (state, actions) => {
      state.pam.isLoading = false;
      state.pam.finance = actions.payload.data;
    })
    .addCase(getPamFinanceChart.rejected, (state) => {
      state.pam.isLoading = false
    })
    
    .addCase(getPamChart.pending, (state) => {
      state.pam.isLoading = true
    })
    .addCase(getPamChart.fulfilled, (state, actions) => {
      state.pam.isLoading = false;
      state.pam.chart = actions.payload.data;
    })
    .addCase(getPamChart.rejected, (state) => {
      state.pam.isLoading = false
    })
  }
})

export default dashboardSlice.reducer