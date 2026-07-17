'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
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
import themeConfig from '@configs/themeConfig'
import { Palette } from '@configs/palette'

// Auth Imports
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

      router.replace(redirectTo && redirectTo.startsWith('/') ? redirectTo : themeConfig.homePageUrl)
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
        <Typography variant='h5' sx={{ color: Palette.ivory }}>
          Welcome back
        </Typography>
        <Typography variant='body2' sx={{ color: Palette.stone }}>
          Sign in to manage your boutique
        </Typography>
      </div>

      {formError && (
        <Alert severity='error' sx={{ backgroundColor: Palette.errorSoft }}>
          {formError}
        </Alert>
      )}

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
        <Controller
          name='password'
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='Password'
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
                        onClick={handleClickShowPassword}
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
        <div className='flex justify-end'>
          <Typography
            component={Link}
            href='/forgot-password'
            variant='body2'
            sx={{ color: Palette.gold, '&:hover': { color: Palette.goldBright } }}
          >
            Forgot password?
          </Typography>
        </div>
        <Button
          fullWidth
          variant='contained'
          type='submit'
          disabled={isSubmitting}
          sx={authButtonSx}
        >
          {isSubmitting ? <CircularProgress size={22} sx={{ color: Palette.richBlack }} /> : 'Sign In'}
        </Button>
      </form>
    </AuthShell>
  )
}

export default Login
