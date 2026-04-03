import RootLayout from '@/components/layouts/RootLayout'
import Form from '@/containers/roles/form'
import React from 'react'
import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { createRole } from '@/store/actions/roles.action'

function Index() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { isSubmitting } = useSelector((state) => state.roles)

  const breadcrumb = [
    {
      label: 'Roles',
      alias: 'roles',
      link: '/settings/roles',
      isDisabled: false,
    },
    {
      label: 'Create Role',
      alias: 'create-role',
      link: '/settings/roles/create',
      isDisabled: true,
    },
  ]

  const handleSubmit = (payload) => {
    dispatch(createRole({ payload }))
  }

  return (
    <RootLayout breadcrumbs={breadcrumb}>
      <div className="flex items-center mb-6 gap-4">
        <IconButton aria-label="back" onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <div>
          <div className="text-[20px] font-bold text-[#333]">Input Data Role</div>
          <div className="text-[#666] tinos-regular">Lengkapi data role dengan benar.</div>
        </div>
      </div>
      <Form isLoading={isSubmitting} onSubmit={handleSubmit} onCancel={() => router.back()} />
    </RootLayout>
  )
}

export default Index
