import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  sidebarToggled: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarToggled = !state.sidebarToggled;
    },
    setSidebarToggled(state, action) {
      state.sidebarToggled = Boolean(action.payload);
    },
  },
})

export const { toggleSidebar, setSidebarToggled } = uiSlice.actions
export default uiSlice.reducer
