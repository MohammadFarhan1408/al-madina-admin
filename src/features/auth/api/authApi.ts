// Auth service functions — thin wrappers over the Axios client (doc §7.1).
import { apiGet, apiPost } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'

import type { AuthResult, User } from '../types'
import type { ForgotPasswordValues, ResetPasswordValues, SignInValues } from '../schema'

export const authApi = {
  signIn: (body: SignInValues) => apiPost<AuthResult>(endpoints.auth.signIn, body),

  me: () => apiGet<User>(endpoints.auth.me),

  signOut: (refreshToken: string) => apiPost<{ success: boolean }>(endpoints.auth.signOut, { refreshToken }),

  forgotPassword: (body: ForgotPasswordValues) =>
    apiPost<{ message?: string }>(endpoints.auth.forgotPassword, body),

  resetPassword: (body: Omit<ResetPasswordValues, 'confirmPassword'>) =>
    apiPost<{ message?: string }>(endpoints.auth.resetPassword, body)
}
