'use client'

import { useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Link from '@components/Link'
import AuthShell from '@components/shared/AuthShell'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/form/Input'
import PasswordInput from '@/components/ui/form/PasswordInput'

import { authApi } from '@/features/auth/api/authApi'
import { resetPasswordSchema, type ResetPasswordValues } from '@/features/auth/schema'
import { ApiError } from '@/libs/api/types'

const ResetPassword = () => {
  const [formError, setFormError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenFromUrl = searchParams.get('token') || ''

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: tokenFromUrl, password: '', confirmPassword: '' }
  })

  const onSubmit = async (values: ResetPasswordValues) => {
    setFormError(null)

    try {
      await authApi.resetPassword({ token: values.token, password: values.password })
      router.replace('/login')
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Unable to reset password. The link may have expired.')
    }
  }

  return (
    <AuthShell subtitle='Reset Password' tagline='The Art of Arabian Perfumery'>
      <div className='flex flex-col gap-1.5'>
        <h1 className='text-xl font-semibold tracking-[-0.01em] text-ivory'>Set a new password</h1>
        <p className='text-sm text-stone'>Choose a password you haven&apos;t used before</p>
      </div>
      {formError && <Alert severity='error'>{formError}</Alert>}
      <form noValidate onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
        {!tokenFromUrl && (
          <Controller
            name='token'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                required
                tone='dark'
                label='Reset token'
                placeholder='Paste the token from your email'
                startAdornment={<i className='tabler-key' />}
                error={errors.token?.message}
              />
            )}
          />
        )}
        <Controller
          name='password'
          control={control}
          render={({ field }) => (
            <PasswordInput
              {...field}
              required
              tone='dark'
              label='New password'
              placeholder='At least 8 characters'
              autoComplete='new-password'
              error={errors.password?.message}
            />
          )}
        />
        <Controller
          name='confirmPassword'
          control={control}
          render={({ field }) => (
            <PasswordInput
              {...field}
              required
              tone='dark'
              label='Confirm password'
              placeholder='Re-enter your new password'
              autoComplete='new-password'
              error={errors.confirmPassword?.message}
            />
          )}
        />
        <Button fullWidth size='lg' type='submit' loading={isSubmitting} className='mt-1'>
          Set new password
        </Button>
        <Link
          href='/login'
          className='flex items-center justify-center gap-1 rounded-xs text-sm font-medium text-primaryLight transition-colors hover:text-primary'
        >
          <i aria-hidden className='tabler-chevron-left text-[16px]' />
          Back to sign in
        </Link>
      </form>
    </AuthShell>
  )
}

export default ResetPassword
