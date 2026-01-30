import {
  MODAL_ERROR,
  MODAL_SESSION,
  MODAL_SUCCESS,
} from '../slices/modal.slice'

export const modalError = (open, meta) => (dispatch) => {
  dispatch(MODAL_ERROR({open:open, meta:meta}))
}

export const modalSuccess = (open, meta) => (dispatch) => {
  dispatch(MODAL_SUCCESS({open:open, meta:meta}))
}

export const modalSession = (open, meta) => (dispatch) => {
  dispatch(MODAL_SESSION({open:open, meta:meta}))
}