import { API } from "@/lib/config/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { errorHelper } from "./logHelper";

export const getRoles = createAsyncThunk("roles/getRoles", async (_, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.get("/masjidku/roles/all");
    const data = await response.data;
    return data;
  } catch (err) {
    dispatch(errorHelper(err));
    return rejectWithValue(err?.response?.data);
  }
});
