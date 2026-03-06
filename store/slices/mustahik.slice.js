import { createSlice } from "@reduxjs/toolkit"
import { createMustahik, deleteMustahik, duplicateMustahik, exportMustahik, getAllMustahik, getDetailMustahik, updateMustahik } from "../actions/mustahik.action"

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
	isLoadingDuplicate: false,
	isLoadingExport: false,
	isLoadingDetail: false,
}

const mustahikSlice = createSlice({
	name: "mustahik",
	initialState: initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(getAllMustahik.pending, (state) => {
				state.isLoading = true
			})
			.addCase(getAllMustahik.fulfilled, (state, actions) => {
				state.isLoading = false
				state.data = actions.payload.data
				state.meta = actions.payload.meta
			})
			.addCase(getAllMustahik.rejected, (state) => {
				state.isLoading = false
			})
			.addCase(getDetailMustahik.pending, (state) => {
				state.isLoadingDetail = true
			})
			.addCase(getDetailMustahik.fulfilled, (state, actions) => {
				state.isLoadingDetail = false
				state.detail = actions.payload.data
			})
			.addCase(getDetailMustahik.rejected, (state) => {
				state.isLoadingDetail = false
			})
			.addCase(createMustahik.pending, (state) => {
				state.isLoadingCreate = true
			})
			.addCase(createMustahik.fulfilled, (state) => {
				state.isLoadingCreate = false
			})
			.addCase(createMustahik.rejected, (state) => {
				state.isLoadingCreate = false
			})
			.addCase(updateMustahik.pending, (state) => {
				state.isLoadingCreate = true
			})
			.addCase(updateMustahik.fulfilled, (state) => {
				state.isLoadingCreate = false
			})
			.addCase(updateMustahik.rejected, (state) => {
				state.isLoadingCreate = false
			})
			.addCase(deleteMustahik.pending, (state) => {
				state.isLoadingDelete = true
			})
			.addCase(deleteMustahik.fulfilled, (state) => {
				state.isLoadingDelete = false
			})
			.addCase(deleteMustahik.rejected, (state) => {
				state.isLoadingDelete = false
			})
			.addCase(duplicateMustahik.pending, (state) => {
				state.isLoadingDuplicate = true
			})
			.addCase(duplicateMustahik.fulfilled, (state) => {
				state.isLoadingDuplicate = false
			})
			.addCase(duplicateMustahik.rejected, (state) => {
				state.isLoadingDuplicate = false
			})
			.addCase(exportMustahik.pending, (state) => {
				state.isLoadingExport = true
			})
			.addCase(exportMustahik.fulfilled, (state) => {
				state.isLoadingExport = false
			})
			.addCase(exportMustahik.rejected, (state) => {
				state.isLoadingExport = false
			})
	}
})

export default mustahikSlice.reducer