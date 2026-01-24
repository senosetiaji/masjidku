import RootLayout from '@/components/layouts/RootLayout'
import BiayaRutinan from '@/containers/pam/biaya-rutinan/BiayaRutinan';
import React from 'react'

function Index() {
  const [params, setParams] = React.useState({
    page: 1,
    limit: 10,
    search: '',
  });
  const breadcrumbs = [
    { label: 'PAM', link: '/pam' },
    { label: 'Biaya Rutinan', link: '/pam/biaya-rutinan' },
  ]
  async function fetchData() {

  }

  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <BiayaRutinan fetchData={fetchData} params={params} setParams={setParams} />
    </RootLayout>
  )
}

export default Index