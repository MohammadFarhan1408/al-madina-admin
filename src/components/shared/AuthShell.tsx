// Shared dark Art Deco shell for auth screens (login, forgot/reset password) —
// matches the mobile app's splash-screen visual language: diamond lattice
// background, brand logo, decorative divider, and a glass card housing the
// form. Always dark, independent of anything else in the admin.
import type { ReactNode } from 'react'

import DecorativeDivider from './DecorativeDivider'

type AuthShellProps = {

  /** Small-caps gold label under the wordmark, e.g. "Admin Portal". */
  subtitle: string
  tagline?: string
  children: ReactNode
}

/** Vertically centres the card on tall viewports but falls back to top-aligned
 *  scrolling on short ones (a landscape phone, or a laptop with the keyboard
 *  open), so the submit button is never stranded below the fold.
 *
 *  `min-h-dvh` rather than `min-h-screen` keeps the layout correct while mobile
 *  browser chrome slides in and out. */
const AuthShell = ({ subtitle, tagline, children }: AuthShellProps) => (
  <div className='am-deco-bg flex min-h-dvh flex-col items-center justify-center gap-7 px-4 py-10 sm:px-6'>
    <header className='flex flex-col items-center gap-3.5 text-center'>
      <img
        src='/images/al-madina-logo.png'
        alt='Al Madina Ittar'
        width={208}
        height={52}
        className='h-auto w-44 object-contain sm:w-52'
      />
      <div className='flex flex-col items-center gap-2'>
        <DecorativeDivider width={36} />
        <p className='text-2xs font-semibold uppercase tracking-[0.2em] text-primaryLight'>{subtitle}</p>
      </div>
    </header>

    {/* The glass treatment is deliberate here and nowhere else: this is the one
        screen with a decorative background for it to read against. */}
    <main className='w-full max-w-105 rounded-xl border border-primary/22 bg-charcoal/65 shadow-xl backdrop-blur-xl'>
      <div className='flex flex-col gap-6 px-6 py-7 sm:px-8 sm:py-8'>{children}</div>
    </main>

    {tagline && <p className='text-2xs tracking-[0.14em] text-ash uppercase'>{tagline}</p>}
  </div>
)

export default AuthShell
