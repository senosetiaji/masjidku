import RootLayout from '@/components/layouts/RootLayout'
import Form from '@/containers/master-data/pelanggan-pam/form/Form'
import React from 'react'
import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { getDetail } from '@/store/actions/master.action';

function Index() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { pid } = router.query;
  const breadcrumb = [
    {
      label: 'Master Data Pelanggan PAM',
      alias: 'master-data-pelanggan-pam',
      link: '/master-data/pelanggan-pam',
      isDisabled: false
    },
    {
      label: 'Edit Pelanggan PAM',
      alias: 'edit-pelanggan-pam',
      link: '/master-data/pelanggan-pam/edit/[pid]',
      isDisabled: true
    }
  ]
  React.useEffect(() => {
    if (!pid) return;
    // You can dispatch an action to fetch the detail data here using the pid
    // dispatch(fetchPelangganDetail(pid));
    dispatch(getDetail({id: pid}))
  }, [pid]);
  return (
    <RootLayout breadcrumbs={breadcrumb}>
      <div className="flex items-center mb-6 gap-4">
        <IconButton aria-label="back" onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <div>
          <div className="text-[20px] font-bold text-[#333]">Formulir Data Pelanggan PAM</div>
          <div className="text-[#666] tinos-regular">Lengkapi data pelanggan PAM dengan benar.</div>
        </div>
      </div>
      <Form isEdit={true} />
    </RootLayout>
  )
}

export default Index
