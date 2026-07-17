'use client'

// Shared dark Art Deco shell for auth screens (login, forgot/reset password) —
// matches the mobile app's splash-screen visual language: diamond lattice
// background, diamond brand mark, serif wordmark, decorative divider, and a
// glass card housing the form. Colours are hard-pinned to the dark brand
// palette (not theme-mode-dependent) so the auth experience always matches the
// mobile app regardless of the admin's light/dark preference.
import type { ReactNode } from 'react'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'

import AuthMark from '@core/svg/AuthMark'
import themeConfig from '@configs/themeConfig'
import { Palette } from '@configs/palette'
import DecorativeDivider from './DecorativeDivider'

/**
 * Shared sx for CustomTextField instances rendered inside the auth shell.
 *
 * `CustomTextField` (@core/components/mui/TextField) always renders MUI's
 * `filled` variant and draws its own border directly on `.MuiInputBase-root`
 * (not the outlined notched-outline) — target those classes, not
 * `.MuiOutlinedInput-*`, or the overrides are silently inert. Colours are
 * hardcoded from `Palette` rather than theme tokens because this shell is
 * always dark regardless of the admin's light/dark preference.
 */
export const authInputSx = {
  '& .MuiInputLabel-root': { color: Palette.stone },
  '& .MuiInputLabel-root.Mui-focused': { color: `${Palette.gold} !important` },
  '& .MuiInputBase-root': {
    color: Palette.ivory,
    borderColor: Palette.glassDarkBorder,
    '&:hover': { borderColor: Palette.bronze },
    '&.Mui-focused': { borderColor: Palette.gold }
  },
  '& .MuiInputBase-input': {
    color: Palette.ivory,
    caretColor: Palette.gold,
    '&::placeholder': { color: Palette.stone, opacity: 1 }
  },
  '& .MuiInputAdornment-root, & .MuiInputAdornment-root .MuiIconButton-root': {
    color: Palette.stone
  },
  '& .MuiFormHelperText-root': { color: Palette.burgundyLight }
}

/** Shared sx for the primary gold CTA button across Login/ForgotPassword/ResetPassword. */
export const authButtonSx = {
  backgroundColor: Palette.gold,
  color: Palette.richBlack,
  fontWeight: 600,
  boxShadow: `0 8px 24px ${Palette.goldGlow}`,
  '&:hover': { backgroundColor: Palette.goldBright }
}

type AuthShellProps = {
  subtitle: string
  tagline?: string
  children: ReactNode
}

const AuthShell = ({ subtitle, tagline, children }: AuthShellProps) => (
  <div className='am-deco-bg flex min-bs-dvh items-center justify-center p-6'>
    <div className='relative flex flex-col items-center gap-8 is-full max-is-[440px]'>
      <div className='flex flex-col items-center gap-4 text-center'>
        <AuthMark style={{ width: 56, height: 56, color: Palette.gold }} />
        <div className='flex flex-col items-center gap-2'>
          <Typography variant='h3' sx={{ color: Palette.ivory, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {themeConfig.templateName}
          </Typography>
          <DecorativeDivider width={40} />
          <Typography variant='overline' sx={{ color: Palette.goldBright, display: 'block', lineHeight: 1.2 }}>
            {subtitle}
          </Typography>
        </div>
      </div>

      <Card
        className='is-full'
        sx={{
          backgroundColor: Palette.glassDark,
          borderColor: Palette.glassDarkBorder,
          backdropFilter: 'blur(16px)'
        }}
      >
        <div className='flex flex-col gap-6 p-8'>{children}</div>
      </Card>

      {tagline && (
        <Typography variant='caption' sx={{ color: Palette.ash, letterSpacing: '0.05em' }}>
          {tagline}
        </Typography>
      )}
    </div>
  </div>
)

export default AuthShell
