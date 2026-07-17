'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Component Imports
import Link from '@components/Link'
import CustomTextField from '@core/components/mui/TextField'
import AuthShell, { authInputSx, authButtonSx } from '@components/shared/AuthShell'

// Config Imports
import { Palette } from '@configs/palette'

// Auth Imports
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
        <Typography variant='h5' sx={{ color: Palette.ivory }}>
          Reset your password
        </Typography>
        <Typography variant='body2' sx={{ color: Palette.stone }}>
          Enter your email and we&apos;ll send you instructions
        </Typography>
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
              <CustomTextField
                {...field}
                autoFocus
                fullWidth
                label='Email'
                placeholder='Enter your email'
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={authInputSx}
              />
            )}
          />
          <Button
            fullWidth
            variant='contained'
            type='submit'
            disabled={isSubmitting}
            sx={authButtonSx}
          >
            {isSubmitting ? <CircularProgress size={22} sx={{ color: Palette.richBlack }} /> : 'Send reset link'}
          </Button>
        </form>
      )}
      <Typography className='flex justify-center items-center' sx={{ color: Palette.gold }}>
        <Link href='/login' className='flex items-center gap-1.5'>
          <i className='tabler-chevron-left' />
          <span>Back to login</span>
        </Link>
      </Typography>
    </AuthShell>
  )
}

export default ForgotPassword
