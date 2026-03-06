import { API } from "@/lib/config/api"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { errorHelper, successHelper } from "./logHelper"

export const getAllPanitiaZakat = createAsyncThunk('panitiaZakat/getAllPanitiaZakat', async ({ params }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.get('/masjidku/panitia-zakat/all', { params: params })
		const data = await response.data
		return data
	} catch (err) {
		dispatch(errorHelper(err))
		return rejectWithValue(err?.response?.data)
	}
})

export const createPanitiaZakat = createAsyncThunk('panitiaZakat/createPanitiaZakat', async ({ payload }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.post('/masjidku/panitia-zakat/create', payload)
		const data = await response.data.data
		dispatch(successHelper('Panitia zakat created successfully', '/zakat/panitia'))
		return data
	} catch (err) {
		dispatch(errorHelper(err))
		return rejectWithValue(err?.response?.data)
	}
})

export const getDetailPanitiaZakat = createAsyncThunk('panitiaZakat/getDetailPanitiaZakat', async ({ id, params }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.get(`/masjidku/panitia-zakat/${id}/detail`, { params: params })
		const data = await response.data
		return data
	} catch (err) {
		dispatch(errorHelper(err))
		return rejectWithValue(err?.response?.data)
	}
})

export const updatePanitiaZakat = createAsyncThunk('panitiaZakat/updatePanitiaZakat', async ({ id, payload }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.put(`/masjidku/panitia-zakat/${id}/edit`, payload)
		const data = await response.data.data
		dispatch(successHelper('Panitia zakat updated successfully', '/zakat/panitia'))
		return data
	} catch (err) {
		dispatch(errorHelper(err))
		return rejectWithValue(err?.response?.data)
	}
})

export const deletePanitiaZakat = createAsyncThunk('panitiaZakat/deletePanitiaZakat', async ({ id, params }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.delete(`/masjidku/panitia-zakat/${id}/delete`, { params: params })
		const data = await response.data.data
		return data
	} catch (err) {
		dispatch(errorHelper(err))
		return rejectWithValue(err?.response?.data)
	}
})
