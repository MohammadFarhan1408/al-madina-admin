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

import { authApi } from '@/features/auth/api/authApi'
import { resetPasswordSchema, type ResetPasswordValues } from '@/features/auth/schema'
import { ApiError } from '@/libs/api/types'

const ResetPassword = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmShown, setIsConfirmShown] = useState(false)
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

  const revealButton = (shown: boolean, toggle: () => void) => (
    <button
      type='button'
      onClick={toggle}
      onMouseDown={e => e.preventDefault()}
      aria-label={shown ? 'Hide password' : 'Show password'}
      className='text-stone hover:text-primary'
    >
      <i className={shown ? 'tabler-eye-off' : 'tabler-eye'} />
    </button>
  )

  return (
    <AuthShell subtitle='Reset Password' tagline='The Art of Arabian Perfumery'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-xl font-semibold text-ivory'>Set a new password</h1>
        <p className='text-sm text-stone'>Your new password must be different from previously used passwords</p>
      </div>
      {formError && <Alert severity='error'>{formError}</Alert>}
      <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
        {!tokenFromUrl && (
          <Controller
            name='token'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                tone='dark'
                label='Reset token'
                placeholder='Paste the token from your email'
                error={errors.token?.message}
              />
            )}
          />
        )}
        <Controller
          name='password'
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              tone='dark'
              label='New password'
              placeholder='············'
              type={isPasswordShown ? 'text' : 'password'}
              error={errors.password?.message}
              endAdornment={revealButton(isPasswordShown, () => setIsPasswordShown(s => !s))}
            />
          )}
        />
        <Controller
          name='confirmPassword'
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              tone='dark'
              label='Confirm password'
              placeholder='············'
              type={isConfirmShown ? 'text' : 'password'}
              error={errors.confirmPassword?.message}
              endAdornment={revealButton(isConfirmShown, () => setIsConfirmShown(s => !s))}
            />
          )}
        />
        <Button fullWidth type='submit' loading={isSubmitting} className='shadow-primaryMd'>
          Set new password
        </Button>
        <Link href='/login' className='flex items-center justify-center gap-1.5 text-primary hover:text-primaryLight'>
          <i className='tabler-chevron-left' />
          <span>Back to login</span>
        </Link>
      </form>
    </AuthShell>
  )
}

export default ResetPassword
