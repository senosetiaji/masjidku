import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { modalError } from '@/store/actions/modal.action'

const ACTION_LABEL = {
  create: 'membuat data',
  update: 'mengubah data',
  delete: 'menghapus data',
}

export function useActionPermissionGuard() {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.user)
  const permissionSet = React.useMemo(() => new Set(currentUser?.permissions || []), [currentUser?.permissions])

  const hasPermission = React.useCallback((permission) => {
    if (!currentUser) return true
    if (permissionSet.has('*')) return true
    if (!permission) return false

    if (Array.isArray(permission)) {
      return permission.some((item) => permissionSet.has(item))
    }

    return permissionSet.has(permission)
  }, [currentUser, permissionSet])

  const guardAction = React.useCallback(({ action = 'update', permission, onAllowed, message }) => {
    const allowed = hasPermission(permission)
    if (!allowed) {
      dispatch(modalError(true, {
        message: message || `Anda tidak memiliki akses untuk ${ACTION_LABEL[action] || 'melakukan aksi ini'}.`,
      }))
      return false
    }

    if (typeof onAllowed === 'function') {
      onAllowed()
    }

    return true
  }, [dispatch, hasPermission])

  return {
    hasPermission,
    guardAction,
  }
}
