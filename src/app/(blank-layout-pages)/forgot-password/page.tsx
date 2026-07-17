// Next Imports
import type { Metadata } from 'next'

// Component Imports
import ForgotPassword from '@views/ForgotPassword'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your Al Madina admin account password'
}

const ForgotPasswordPage = () => <ForgotPassword />

export default ForgotPasswordPage
