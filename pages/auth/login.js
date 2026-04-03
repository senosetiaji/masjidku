import Login from '@/containers/auth'
import React from 'react'
import { redirectAuthenticatedUser } from '@/lib/helpers/redirectAuthenticatedUser'

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
function Index(props) {
  return (
    <div>
        <Login />
    </div>
  )
}

export async function getServerSideProps(context) {
  return redirectAuthenticatedUser(context, '/dashboard');
}

export default Index