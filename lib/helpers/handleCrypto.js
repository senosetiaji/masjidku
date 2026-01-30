import { d, e } from '@/util/pkg/init_redux'

// Simple readiness check to avoid calling into WASM before it's initialized on the client
const isWasmReady = () => {
  try {
    return typeof window !== 'undefined' && globalThis.__wasmInitReduxReady === true;
  } catch (_) {
    return false;
  }
}

export const encryptAesWithKey = (data) => {
  if (data) {
    try {
      if (!isWasmReady()) return null
      return e(data)
    }
    catch(err) {
      // Silently return null if not ready or any error occurs
      return null
    }
  }

  return null
}

export const decryptAes = (enc) => {
  if (enc) {
    try {
      if (!isWasmReady()) return null
      return d(enc)
    }catch(err){
      // Silently return null if not ready or any error occurs
      return null
    }
  }
  return null
}

