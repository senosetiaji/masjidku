import { API } from "@/lib/config/api"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { errorHelper, successHelper } from "./logHelper"

export const getAllMustahik = createAsyncThunk('mustahik/getAllMustahik', async ({ params }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.get('/masjidku/mustahik/all', { params: params })
		const data = await response.data
		return data
	} catch (err) {
		dispatch(errorHelper(err))
		return rejectWithValue(err?.response?.data)
	}
})

export const createMustahik = createAsyncThunk('mustahik/createMustahik', async ({ payload }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.post('/masjidku/mustahik/create', payload)
		const data = await response.data.data
		dispatch(successHelper('Mustahik created successfully', '/mustahik'))
		return data
	} catch (err) {
		dispatch(errorHelper(err))
		return rejectWithValue(err?.response?.data)
	}
})

export const getDetailMustahik = createAsyncThunk('mustahik/getDetailMustahik', async ({ id, params }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.get(`/masjidku/mustahik/${id}/detail`, { params: params })
		const data = await response.data
		return data
	} catch (err) {
		dispatch(errorHelper(err))
		return rejectWithValue(err?.response?.data)
	}
})

export const updateMustahik = createAsyncThunk('mustahik/updateMustahik', async ({ id, payload }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.put(`/masjidku/mustahik/${id}/edit`, payload)
		const data = await response.data.data
		dispatch(successHelper('Mustahik updated successfully', '/mustahik'))
		return data
	} catch (err) {
		dispatch(errorHelper(err))
		return rejectWithValue(err?.response?.data)
	}
})

export const deleteMustahik = createAsyncThunk('mustahik/deleteMustahik', async ({ id, params }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.delete(`/masjidku/mustahik/${id}/delete`, { params: params })
		const data = await response.data.data
		return data
	} catch (err) {
		dispatch(errorHelper(err))
		return rejectWithValue(err?.response?.data)
	}
})