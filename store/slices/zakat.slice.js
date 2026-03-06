import { createSlice } from "@reduxjs/toolkit"
import { createZakat, deleteZakat, getAllZakat, getDetailZakat, updateZakat } from "../actions/zakat.action"

export const initialState = {
	data: [],
	detail: null,
	meta: {
		total_row: 0,
		total_page: 0,
	},
	isLoading: false,
	isLoadingCreate: false,
	isLoadingDelete: false,
	isLoadingDetail: false,
}

const zakatSlice = createSlice({
	name: "zakat",
	initialState: initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(getAllZakat.pending, (state) => {
				state.isLoading = true
			})
			.addCase(getAllZakat.fulfilled, (state, actions) => {
				state.isLoading = false
				state.data = actions.payload.data
				state.meta = actions.payload.meta
			})
			.addCase(getAllZakat.rejected, (state) => {
				state.isLoading = false
			})
			.addCase(getDetailZakat.pending, (state) => {
				state.isLoadingDetail = true
			})
			.addCase(getDetailZakat.fulfilled, (state, actions) => {
				state.isLoadingDetail = false
				state.detail = actions.payload.data
			})
			.addCase(getDetailZakat.rejected, (state) => {
				state.isLoadingDetail = false
			})
			.addCase(createZakat.pending, (state) => {
				state.isLoadingCreate = true
			})
			.addCase(createZakat.fulfilled, (state) => {
				state.isLoadingCreate = false
			})
			.addCase(createZakat.rejected, (state) => {
				state.isLoadingCreate = false
			})
			.addCase(updateZakat.pending, (state) => {
				state.isLoadingCreate = true
			})
			.addCase(updateZakat.fulfilled, (state) => {
				state.isLoadingCreate = false
			})
			.addCase(updateZakat.rejected, (state) => {
				state.isLoadingCreate = false
			})
			.addCase(deleteZakat.pending, (state) => {
				state.isLoadingDelete = true
			})
			.addCase(deleteZakat.fulfilled, (state) => {
				state.isLoadingDelete = false
			})
			.addCase(deleteZakat.rejected, (state) => {
				state.isLoadingDelete = false
			})
	}
})

export default zakatSlice.reducer
