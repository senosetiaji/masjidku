import { API } from "@/lib/config/api"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { errorHelper, successHelper } from "./logHelper"

export const getFinance = createAsyncThunk('finance/getFinance', async ({params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/finance/all', { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const getDetail = createAsyncThunk('finance/getDetail', async ({id, params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get(`/masjidku/finance/${id}/detail`, { params: params })
    const data = await response.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const deleteData = createAsyncThunk('finance/deleteData', async ({id, params}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.delete(`/masjidku/finance/${id}/delete`, { params: params })
    const data = await response.data.data
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const createFinance = createAsyncThunk('finance/createFinance', async ({payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post('/masjidku/finance/create', payload)
    const data = await response.data.data
    dispatch(successHelper('Finance created successfully', '/keuangan/laporan-keuangan'))
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const updateDataFinance = createAsyncThunk('finance/updateDataFinance', async ({id, payload}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post(`/masjidku/finance/${id}/update`, payload)
    const data = await response.data.data
    dispatch(successHelper('Finance updated successfully', '/keuangan/laporan-keuangan'))
    return data
  } catch(err){
    dispatch(errorHelper(err))
    return rejectWithValue(err?.response?.data)
  }
})

export const exportFinance = createAsyncThunk('finance/exportFinance', async ({ params }, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get('/masjidku/finance/export', {
      params,
      responseType: 'blob',
    });

    const disposition = response.headers['content-disposition'] || '';
    const match = disposition.match(/filename="?([^";]+)"?/i);
    const filename = match ? match[1] : 'keuangan-masjid.pdf';

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