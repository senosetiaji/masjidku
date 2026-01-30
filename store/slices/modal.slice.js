import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  isModalError:false,
  metaError:null,

  isModalSuccess:false,
  isModalSession:false,
  metaSuccess:null,
  metaSession:null,

}

const modalSlice = createSlice({
	name:"modal",
	initialState:initialState,
	reducers:{
    MODAL_ERROR(state, actions){
      state.isModalError = actions.payload.open
      state.metaError = actions.payload.meta
    },
    MODAL_SUCCESS(state, actions){
      state.isModalSuccess = actions.payload.open
      state.metaSuccess = actions.payload.meta
    },
    MODAL_SESSION(state, actions){
      state.isModalSession = actions.payload.open
      state.metaSession = actions.payload.meta
    },

	}
})

export const { 
  MODAL_ERROR,
  MODAL_SUCCESS,
  MODAL_SESSION,
} = modalSlice.actions

export default modalSlice.reducer