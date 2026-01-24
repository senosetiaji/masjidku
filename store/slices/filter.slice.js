import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  kontrakManajemen: {
    values: null,
    appliedAt: null,
  },
  verifikasiKontrakManajemen: {
    values: null,
    appliedAt: null,
  },
  targetBulanan: {
    values: null,
    appliedAt: null,
  },
  verifikasiTargetBulanan: {
    values: null,
    appliedAt: null,
  },
  verifikasiRealisasi: {
    values: null,
    appliedAt: null,
  },
  ttd_km: {
    values: null,
    appliedAt: null,
  },
  realisasi_input: {
    values: null,
    appliedAt: null,
  },
  realisasi_divisi: {
    values: null,
    appliedAt: null,
  },
  realisasi_monitoring: {
    values: null,
    appliedAt: null,
  },
  realisasi_prognosa: {
    values: null,
    appliedAt: null,
  },
  realisasi_lola: {
    values: null,
    appliedAt: null,
  },
  nko_realisasi: {
    values: null,
    appliedAt: null,
  },
  nko_prognosa: {
    values: null,
    appliedAt: null,
  },
  nko_rekap: {
    values: null,
    appliedAt: null,
  },
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setFilter(state, action) {
      console.log(action);
      
      const { key, values } = action.payload;
      state[key] = { values, appliedAt: Date.now() };
    },
    clearFilter(state, action) {
      const { key } = action.payload;
      state[key] = { values: null, appliedAt: null };
    },
  },
});

export const { setFilter, clearFilter } = filterSlice.actions;
export default filterSlice.reducer;