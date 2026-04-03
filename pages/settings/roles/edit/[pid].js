import RootLayout from '@/components/layouts/RootLayout'
import Form from '@/containers/roles/form'
import React from 'react'
import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { getRoleDetail, updateRole } from '@/store/actions/roles.action'

function Index() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { pid } = router.query
  const { detail, isSubmitting } = useSelector((state) => state.roles)

  const breadcrumb = [
    {
      label: 'Roles',
      alias: 'roles',
      link: '/settings/roles',
      isDisabled: false,
    },
    {
      label: 'Edit Role',
      alias: 'edit-role',
      link: '/settings/roles/edit/[pid]',
      isDisabled: true,
    },
  ]

  React.useEffect(() => {
    if (!pid) return
    dispatch(getRoleDetail({ id: pid }))
  }, [dispatch, pid])

  const handleSubmit = (payload) => {
    if (!pid) return
    dispatch(updateRole({ id: pid, payload }))
  }

  return (
    <RootLayout breadcrumbs={breadcrumb}>
      <div className="flex items-center mb-6 gap-4">
        <IconButton aria-label="back" onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <div>
          <div className="text-[20px] font-bold text-[#333]">Edit Data Role</div>
          <div className="text-[#666] tinos-regular">Perbarui data role dengan benar.</div>
        </div>
      </div>
      <Form
        isEdit
        detail={detail}
        isLoading={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </RootLayout>
  )
}

export default Index
