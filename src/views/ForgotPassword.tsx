'use client'

import { useState } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Link from '@components/Link'
import AuthShell from '@components/shared/AuthShell'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/form/Input'

import { authApi } from '@/features/auth/api/authApi'
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/features/auth/schema'

const ForgotPassword = () => {
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  })

  const onSubmit = async (values: ForgotPasswordValues) => {
    // The backend answers success for unknown emails (no account enumeration),
    // so any real failure here is a network/server problem worth showing.
    setFormError(null)

    try {
      await authApi.forgotPassword(values)
      setSent(true)
    } catch {
      setFormError('Could not send the reset link. Check your connection and try again.')
    }
  }

  return (
    <AuthShell subtitle='Forgot Password' tagline='The Art of Arabian Perfumery'>
      <div className='flex flex-col gap-1.5'>
        <h1 className='text-xl font-semibold tracking-[-0.01em] text-ivory'>Reset your password</h1>
        <p className='text-sm text-stone'>Enter your email and we&apos;ll send you instructions</p>
      </div>

      {sent ? (
        <Alert severity='success' title='Check your inbox'>
          If an account exists for that email, a reset link is on its way. The link expires in one hour.
        </Alert>
      ) : (
        <form noValidate onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          {formError && <Alert severity='error'>{formError}</Alert>}
          <Controller
            name='email'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                autoFocus
                required
                tone='dark'
                type='email'
                label='Email'
                placeholder='you@almadina.com'
                autoComplete='email'
                startAdornment={<i className='tabler-mail' />}
                error={errors.email?.message}
              />
            )}
          />
          <Button fullWidth size='lg' type='submit' loading={isSubmitting} className='mt-1'>
            Send reset link
          </Button>
        </form>
      )}
      <Link
        href='/login'
        className='flex items-center justify-center gap-1 rounded-xs text-sm font-medium text-primaryLight transition-colors hover:text-primary'
      >
        <i aria-hidden className='tabler-chevron-left text-[16px]' />
        Back to sign in
      </Link>
    </AuthShell>
  )
}

export default ForgotPassword
