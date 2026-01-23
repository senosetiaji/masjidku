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

  console.log(msg);
  
  if(code == 400) {
    if (error?.data?.messages == 'request_timeout') {
      window.location.href = '/503';
      return;
    }
  }

  if(code == 401){
    if (error?.data?.messages == 'password_expired' || error?.data?.messages == 'user_reset_password') {
      window.location.href = '/reset-password';
      return;
    }
    msg = "unauthorized"
  }

  if(code == 403){
    if (error?.data?.message == 'extend_session') {
      dispatch(logout());
      return;
    }
  }
  
  let meta = {
    message:errorMessage(msg),
    vcc_code:code,
  }

  dispatch(modalError(true, meta))
  const logoutHandler = async () => {
    await dispatch(logout());
    window.location.href = '/';
  }
  if((code == 401 || code == 403) && msg.toLowerCase() == 'unauthorized') {
    logoutHandler();
  }
}