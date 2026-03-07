import { API } from "@/lib/config/api"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { errorHelper, successHelper } from "./logHelper"

export const getAllZakat = createAsyncThunk('zakat/getAllZakat', async ({ params }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.get('/masjidku/zakat/all', { params: params })
		const data = await response.data
		return data
	} catch (err) {
		dispatch(errorHelper(err))
		return rejectWithValue(err?.response?.data)
	}
})

export const getZakatSummary = createAsyncThunk('zakat/getZakatSummary', async ({ params }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.get('/masjidku/zakat/summary', { params: params })
		const data = await response.data
		return data
	} catch (err) {
		dispatch(errorHelper(err))
		return rejectWithValue(err?.response?.data)
	}
})

export const createZakat = createAsyncThunk('zakat/createZakat', async ({ payload }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.post('/masjidku/zakat/create', payload)
		const data = await response.data.data
		dispatch(successHelper('Zakat created successfully', '/zakat'))
		return data
	} catch (err) {
		dispatch(errorHelper(err))
		return rejectWithValue(err?.response?.data)
	}
})

export const getDetailZakat = createAsyncThunk('zakat/getDetailZakat', async ({ id, params }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.get(`/masjidku/zakat/${id}/detail`, { params: params })
		const data = await response.data
		return data
	} catch (err) {
		dispatch(errorHelper(err))
		return rejectWithValue(err?.response?.data)
	}
})

export const updateZakat = createAsyncThunk('zakat/updateZakat', async ({ id, payload }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.put(`/masjidku/zakat/${id}/edit`, payload)
		const data = await response.data.data
		dispatch(successHelper('Zakat updated successfully', '/zakat'))
		return data
	} catch (err) {
		dispatch(errorHelper(err))
		return rejectWithValue(err?.response?.data)
	}
})

export const deleteZakat = createAsyncThunk('zakat/deleteZakat', async ({ id, params }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.delete(`/masjidku/zakat/${id}/delete`, { params: params })
		const data = await response.data.data
		return data
	} catch (err) {
		dispatch(errorHelper(err))
		return rejectWithValue(err?.response?.data)
	}
})
