// React Imports
import { Suspense } from 'react'

// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Login from '@views/Login'
import BrandLoader from '@components/shared/BrandLoader'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to the Al Madina Ittar admin panel'
}

const LoginPage = () => (
  <Suspense fallback={<BrandLoader />}>
    <Login />
  </Suspense>
)

export default LoginPage
