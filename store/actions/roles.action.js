import { API } from "@/lib/config/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { errorHelper, successHelper } from "./logHelper";

export const getRoles = createAsyncThunk("roles/getRoles", async ({ params } = {}, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get("/masjidku/roles/all", { params });
    const data = await response.data;
    return data;
  } catch (err) {
    dispatch(errorHelper(err));
    return rejectWithValue(err?.response?.data);
  }
});

export const getRoleDetail = createAsyncThunk("roles/getRoleDetail", async ({ id }, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get(`/masjidku/roles/${id}/detail`);
    const data = await response.data;
    return data;
  } catch (err) {
    dispatch(errorHelper(err));
    return rejectWithValue(err?.response?.data);
  }
});

export const createRole = createAsyncThunk("roles/createRole", async ({ payload }, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post("/masjidku/roles/create", payload);
    const data = await response.data;
    dispatch(successHelper("Role berhasil ditambahkan.", "/settings/roles"));
    return data;
  } catch (err) {
    dispatch(errorHelper(err));
    return rejectWithValue(err?.response?.data);
  }
});

export const updateRole = createAsyncThunk("roles/updateRole", async ({ id, payload }, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post(`/masjidku/roles/${id}/update`, payload);
    const data = await response.data;
    dispatch(successHelper("Role berhasil diperbarui.", "/settings/roles"));
    return data;
  } catch (err) {
    dispatch(errorHelper(err));
    return rejectWithValue(err?.response?.data);
  }
});

export const deleteRole = createAsyncThunk("roles/deleteRole", async ({ id }, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.delete(`/masjidku/roles/${id}/delete`);
    const data = await response.data;
    dispatch(successHelper("Role berhasil dihapus."));
    return data;
  } catch (err) {
    dispatch(errorHelper(err));
    return rejectWithValue(err?.response?.data);
  }
});
