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

import { useAuth } from '@/contexts/AuthContext'
import { signInSchema, type SignInValues } from '@/features/auth/schema'
import { ApiError } from '@/libs/api/types'

const Login = () => {
  const [formError, setFormError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' }
  })

  const onSubmit = async (values: SignInValues) => {
    setFormError(null)

    try {
      await signIn(values)
      const redirectTo = searchParams.get('redirectTo')

      router.replace(redirectTo && /^\/(?![/\\])/.test(redirectTo) ? redirectTo : '/dashboard')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.code === 'INVALID_CREDENTIALS'
            ? 'Invalid email or password.'
            : err.message
          : 'Something went wrong. Please try again.'

      setFormError(message)
    }
  }

  return (
    <AuthShell subtitle='Admin Portal' tagline='The Art of Arabian Perfumery'>
      <div className='flex flex-col gap-1.5'>
        <h1 className='text-xl font-semibold tracking-[-0.01em] text-ivory'>Welcome back</h1>
        <p className='text-sm text-stone'>Sign in to manage your boutique</p>
      </div>

      {formError && <Alert severity='error'>{formError}</Alert>}

      {/* `autoComplete` is on so password managers can fill and save these —
          switching it off on a login form fights the user's own tooling. */}
      <form noValidate onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
        <Controller
          name='email'
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              autoFocus
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
        <Controller
          name='password'
          control={control}
          render={({ field }) => (
            <PasswordInput
              {...field}
              tone='dark'
              label='Password'
              placeholder='Enter your password'
              autoComplete='current-password'
              error={errors.password?.message}
            />
          )}
        />

        <div className='flex justify-end'>
          <Link
            href='/forgot-password'
            className='rounded-xs text-sm font-medium text-primaryLight transition-colors hover:text-primary hover:underline hover:underline-offset-2'
          >
            Forgot password?
          </Link>
        </div>

        <Button fullWidth size='lg' type='submit' loading={isSubmitting} className='mt-1'>
          Sign in
        </Button>
      </form>
    </AuthShell>
  )
}

export default Login
