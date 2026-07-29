'use client'

import { useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Link from '@components/Link'
import AuthShell from '@components/shared/AuthShell'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

import { useAuth } from '@/contexts/AuthContext'
import { signInSchema, type SignInValues } from '@/features/auth/schema'
import { ApiError } from '@/libs/api/types'

const Login = () => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Hooks
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

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit = async (values: SignInValues) => {
    setFormError(null)

    try {
      await signIn(values)
      const redirectTo = searchParams.get('redirectTo')

      router.replace(redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard')
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
      <div className='flex flex-col gap-1'>
        <h1 className='text-xl font-semibold text-ivory'>Welcome back</h1>
        <p className='text-sm text-stone'>Sign in to manage your boutique</p>
      </div>

      {formError && <Alert severity='error'>{formError}</Alert>}

      <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
        <Controller
          name='email'
          control={control}
          render={({ field }) => (
            <Input {...field} autoFocus tone='dark' label='Email' placeholder='Enter your email' error={errors.email?.message} />
          )}
        />
        <Controller
          name='password'
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              tone='dark'
              label='Password'
              placeholder='············'
              type={isPasswordShown ? 'text' : 'password'}
              error={errors.password?.message}
              endAdornment={
                <button
                  type='button'
                  onClick={handleClickShowPassword}
                  onMouseDown={e => e.preventDefault()}
                  aria-label={isPasswordShown ? 'Hide password' : 'Show password'}
                  className='text-stone hover:text-primary'
                >
                  <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                </button>
              }
            />
          )}
        />
        <div className='flex justify-end'>
          <Link href='/forgot-password' className='text-sm text-primary hover:text-primaryLight'>
            Forgot password?
          </Link>
        </div>
        <Button fullWidth type='submit' loading={isSubmitting} className='shadow-primaryMd'>
          Sign In
        </Button>
      </form>
    </AuthShell>
  )
}

export default Login
