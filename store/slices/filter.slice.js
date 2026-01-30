import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pam_rutinan: {
    values: null,
    appliedAt: null,
  },
  kas: {
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