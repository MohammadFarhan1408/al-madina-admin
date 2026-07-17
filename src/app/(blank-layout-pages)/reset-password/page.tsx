// React Imports
import { Suspense } from 'react'

// Next Imports
import type { Metadata } from 'next'

// Component Imports
import ResetPassword from '@views/ResetPassword'
import BrandLoader from '@components/shared/BrandLoader'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your Al Madina admin account'
}

const ResetPasswordPage = () => (
  <Suspense fallback={<BrandLoader />}>
    <ResetPassword />
  </Suspense>
)

export default ResetPasswordPage
