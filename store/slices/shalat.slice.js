import { createSlice } from '@reduxjs/toolkit'
import { getJadwalShalatBulanan, getShalatKabkota, getShalatProvinsi } from '../actions/shalat.action'

export const initialState = {
  provinsi: [],
  kabkota: [],
  jadwal: null,
  isLoadingProvinsi: false,
  isLoadingKabkota: false,
  isLoadingJadwal: false,
}

const shalatSlice = createSlice({
  name: 'shalat',
  initialState,
  reducers: {
    clearKabkota: (state) => {
      state.kabkota = []
    },
    clearJadwal: (state) => {
      state.jadwal = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getShalatProvinsi.pending, (state) => {
        state.isLoadingProvinsi = true
      })
      .addCase(getShalatProvinsi.fulfilled, (state, action) => {
        state.isLoadingProvinsi = false
        state.provinsi = action.payload?.data || []
      })
      .addCase(getShalatProvinsi.rejected, (state) => {
        state.isLoadingProvinsi = false
      })

      .addCase(getShalatKabkota.pending, (state) => {
        state.isLoadingKabkota = true
      })
      .addCase(getShalatKabkota.fulfilled, (state, action) => {
        state.isLoadingKabkota = false
        state.kabkota = action.payload?.data || []
      })
      .addCase(getShalatKabkota.rejected, (state) => {
        state.isLoadingKabkota = false
      })

      .addCase(getJadwalShalatBulanan.pending, (state) => {
        state.isLoadingJadwal = true
      })
      .addCase(getJadwalShalatBulanan.fulfilled, (state, action) => {
        state.isLoadingJadwal = false
        state.jadwal = action.payload?.data || null
      })
      .addCase(getJadwalShalatBulanan.rejected, (state) => {
        state.isLoadingJadwal = false
      })
  },
})

export const { clearKabkota, clearJadwal } = shalatSlice.actions
export default shalatSlice.reducer
