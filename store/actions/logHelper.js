import { errorMessage } from "@/lib/helpers/errorMessage"
import { modalError, modalSuccess } from "./modal.action"
import { logout } from "./auth.action"

export const successHelper = (message, backLink) => (dispatch) => {
  let msg = message?message:"Data berhasil diproses !"
  let meta = {
    message:msg,
    backLink:backLink
  }
  dispatch(modalSuccess(true, meta))
}

export const errorHelper = (err, message) => (dispatch) => {
  const error = err.response
  const code = error?.data?.status
  let msg = message? message:(error?.data?.message || error?.data?.messages)
  
  let meta = {
    message:errorMessage(msg),
    vcc_code:code,
  }
  
  async function logoutHandler() {
    await dispatch(logout({}));
    window.location.href = '/auth/login';
  }

  if(code == 401 && msg.toLowerCase() == 'unauthorized') {
    logoutHandler();
  }
  dispatch(modalError(true, meta))
}