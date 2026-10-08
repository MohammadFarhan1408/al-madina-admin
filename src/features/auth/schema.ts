// Client-side Zod schemas mirroring backend auth request bodies (doc §7.1).
import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required')
})

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email')
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),

    // Mirrors the API's password policy (auth.schema.ts) so the user sees the rule
    // before submitting instead of a 422 after.
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Password must include a letter')
      .regex(/\d/, 'Password must include a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine(v => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

export type SignInValues = z.infer<typeof signInSchema>
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
