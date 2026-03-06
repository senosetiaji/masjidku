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

export const duplicateMustahik = createAsyncThunk('mustahik/duplicateMustahik', async ({ payload }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.post('/masjidku/mustahik/duplicate', payload)
		const data = await response.data
		dispatch(successHelper('Data mustahik berhasil diduplikasi'))
		return data
	} catch (err) {
		dispatch(errorHelper(err))
		return rejectWithValue(err?.response?.data)
	}
})

export const exportMustahik = createAsyncThunk('mustahik/exportMustahik', async ({ params }, { dispatch, rejectWithValue }) => {
	try {
		const response = await API.get('/masjidku/mustahik/export', {
			params,
			responseType: 'blob',
		});

		const disposition = response.headers['content-disposition'] || '';
		const match = disposition.match(/filename="?([^";]+)"?/i);
		const filename = match ? match[1] : 'mustahik.pdf';

		const blob = new Blob([response.data], { type: 'application/pdf' });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', filename);
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);

		return { filename };
	} catch (err) {
		dispatch(errorHelper(err));
		return rejectWithValue(err?.response?.data);
	}
})