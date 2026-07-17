'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
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

  return (
    <AuthShell subtitle='Reset Password' tagline='The Art of Arabian Perfumery'>
      <div className='flex flex-col gap-1'>
        <Typography variant='h5' sx={{ color: Palette.ivory }}>
          Set a new password
        </Typography>
        <Typography variant='body2' sx={{ color: Palette.stone }}>
          Your new password must be different from previously used passwords
        </Typography>
      </div>
      {formError && (
        <Alert severity='error' sx={{ backgroundColor: Palette.errorSoft }}>
          {formError}
        </Alert>
      )}
      <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
        {!tokenFromUrl && (
          <Controller
            name='token'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Reset token'
                placeholder='Paste the token from your email'
                error={!!errors.token}
                helperText={errors.token?.message}
                sx={authInputSx}
              />
            )}
          />
        )}
        <Controller
          name='password'
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='New password'
              placeholder='············'
              type={isPasswordShown ? 'text' : 'password'}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={authInputSx}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={() => setIsPasswordShown(s => !s)}
                        onMouseDown={e => e.preventDefault()}
                        aria-label={isPasswordShown ? 'Hide password' : 'Show password'}
                        sx={{ color: Palette.stone }}
                      >
                        <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
          )}
        />
        <Controller
          name='confirmPassword'
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='Confirm password'
              placeholder='············'
              type={isConfirmShown ? 'text' : 'password'}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              sx={authInputSx}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={() => setIsConfirmShown(s => !s)}
                        onMouseDown={e => e.preventDefault()}
                        aria-label={isConfirmShown ? 'Hide password' : 'Show password'}
                        sx={{ color: Palette.stone }}
                      >
                        <i className={isConfirmShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
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
          {isSubmitting ? <CircularProgress size={22} sx={{ color: Palette.richBlack }} /> : 'Set new password'}
        </Button>
        <Typography className='flex justify-center items-center' sx={{ color: Palette.gold }}>
          <Link href='/login' className='flex items-center gap-1.5'>
            <i className='tabler-chevron-left' />
            <span>Back to login</span>
          </Link>
        </Typography>
      </form>
    </AuthShell>
  )
}

export default ResetPassword
