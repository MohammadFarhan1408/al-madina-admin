// Shared dark Art Deco shell for auth screens (login, forgot/reset password) —
// matches the mobile app's splash-screen visual language: diamond lattice
// background, brand logo, decorative divider, and a glass card housing the
// form. Always dark, independent of anything else in the admin.
import type { ReactNode } from 'react'

import DecorativeDivider from './DecorativeDivider'

type AuthShellProps = {
  subtitle: string
  tagline?: string
  children: ReactNode
}

const AuthShell = ({ subtitle, tagline, children }: AuthShellProps) => (
  <div className='am-deco-bg flex min-h-dvh items-center justify-center p-6'>
    <div className='relative flex w-full max-w-[440px] flex-col items-center gap-8'>
      <div className='flex flex-col items-center gap-4 text-center'>
        <img src='/images/al-madina-logo.png' alt='Al Madina' className='w-52 object-contain' />
        <div className='flex flex-col items-center gap-2'>
          <DecorativeDivider width={40} />
          <span className='block text-xs font-semibold uppercase leading-tight tracking-widest text-primaryLight'>
            {subtitle}
          </span>
        </div>
      </div>

      <div className='w-full rounded-lg border border-primary/25 bg-charcoal/60 backdrop-blur-lg'>
        <div className='flex flex-col gap-6 p-8'>{children}</div>
      </div>

      {tagline && <span className='text-xs tracking-wide text-ash'>{tagline}</span>}
    </div>
  </div>
)

export default AuthShell
