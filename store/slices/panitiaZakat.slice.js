import { createSlice } from "@reduxjs/toolkit"
import { createPanitiaZakat, deletePanitiaZakat, getAllPanitiaZakat, getDetailPanitiaZakat, updatePanitiaZakat } from "../actions/panitiaZakat.action"

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

const panitiaZakatSlice = createSlice({
	name: "panitiaZakat",
	initialState: initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(getAllPanitiaZakat.pending, (state) => {
				state.isLoading = true
			})
			.addCase(getAllPanitiaZakat.fulfilled, (state, actions) => {
				state.isLoading = false
				state.data = actions.payload.data
				state.meta = actions.payload.meta
			})
			.addCase(getAllPanitiaZakat.rejected, (state) => {
				state.isLoading = false
			})
			.addCase(getDetailPanitiaZakat.pending, (state) => {
				state.isLoadingDetail = true
			})
			.addCase(getDetailPanitiaZakat.fulfilled, (state, actions) => {
				state.isLoadingDetail = false
				state.detail = actions.payload.data
			})
			.addCase(getDetailPanitiaZakat.rejected, (state) => {
				state.isLoadingDetail = false
			})
			.addCase(createPanitiaZakat.pending, (state) => {
				state.isLoadingCreate = true
			})
			.addCase(createPanitiaZakat.fulfilled, (state) => {
				state.isLoadingCreate = false
			})
			.addCase(createPanitiaZakat.rejected, (state) => {
				state.isLoadingCreate = false
			})
			.addCase(updatePanitiaZakat.pending, (state) => {
				state.isLoadingCreate = true
			})
			.addCase(updatePanitiaZakat.fulfilled, (state) => {
				state.isLoadingCreate = false
			})
			.addCase(updatePanitiaZakat.rejected, (state) => {
				state.isLoadingCreate = false
			})
			.addCase(deletePanitiaZakat.pending, (state) => {
				state.isLoadingDelete = true
			})
			.addCase(deletePanitiaZakat.fulfilled, (state) => {
				state.isLoadingDelete = false
			})
			.addCase(deletePanitiaZakat.rejected, (state) => {
				state.isLoadingDelete = false
			})
	}
})

export default panitiaZakatSlice.reducer
