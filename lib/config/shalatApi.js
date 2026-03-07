import axios from 'axios'

const SHALAT_API_BASE = process.env.NEXT_PUBLIC_SHALAT_API_BASE || 'https://equran.id/api/v2/shalat'

const SHALAT_API = axios.create({
  baseURL: SHALAT_API_BASE,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
})

export {
  SHALAT_API,
}
