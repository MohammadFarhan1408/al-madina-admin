'use client'

import { useState } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Link from '@components/Link'
import AuthShell from '@components/shared/AuthShell'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

import { authApi } from '@/features/auth/api/authApi'
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/features/auth/schema'

const ForgotPassword = () => {
  const [sent, setSent] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  })

  const onSubmit = async (values: ForgotPasswordValues) => {
    // Backend always responds success to avoid account enumeration.
    await authApi.forgotPassword(values).catch(() => undefined)
    setSent(true)
  }

  return (
    <AuthShell subtitle='Forgot Password' tagline='The Art of Arabian Perfumery'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-xl font-semibold text-ivory'>Reset your password</h1>
        <p className='text-sm text-stone'>Enter your email and we&apos;ll send you instructions</p>
      </div>

      {sent ? (
        <Alert severity='success'>
          If an account exists for that email, a reset link has been sent. Please check your inbox.
        </Alert>
      ) : (
        <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
          <Controller
            name='email'
            control={control}
            render={({ field }) => (
              <Input {...field} autoFocus tone='dark' label='Email' placeholder='Enter your email' error={errors.email?.message} />
            )}
          />
          <Button fullWidth type='submit' loading={isSubmitting} className='shadow-primaryMd'>
            Send reset link
          </Button>
        </form>
      )}
      <Link href='/login' className='flex items-center justify-center gap-1.5 text-primary hover:text-primaryLight'>
        <i className='tabler-chevron-left' />
        <span>Back to login</span>
      </Link>
    </AuthShell>
  )
}

export default ForgotPassword
