import type { ReactNode } from 'react'

import classnames from 'classnames'

import IconButton from './IconButton'

export type NavbarProps = {
  onMenuToggle?: () => void

  /** Left-hand slot — search, so the bar starts with something usable rather
   *  than empty space with everything pushed right. */
  children?: ReactNode

  /** Right-hand slot — the account menu, and any future notification controls. */
  actions?: ReactNode
  className?: string
}

/** Sticky application header. Translucent with a backdrop blur so content
 *  scrolling underneath stays legible without the bar turning opaque and heavy.
 *
 *  Its inner row carries the same gutters and max width as `<main>`, so the
 *  search and the account menu line up with the page content beneath them
 *  instead of drifting to the window edges on a wide display. */
const Navbar = ({ onMenuToggle, children, actions, className }: NavbarProps) => (
  <header
    className={classnames(
      'sticky top-0 z-(--z-sticky) h-(--header-height) shrink-0 border-b border-border',
      'bg-backgroundDefault/85 px-4 backdrop-blur-md md:px-6 xl:px-8',
      className
    )}
  >
    <div className='mx-auto flex h-full w-full max-w-[1600px] items-center gap-2 sm:gap-4'>
      {onMenuToggle && (
        <IconButton aria-label='Open navigation' onClick={onMenuToggle} className='-ml-1.5 lg:hidden'>
          <i className='tabler-menu-2' />
        </IconButton>
      )}
      <div className='flex min-w-0 flex-1 items-center'>{children}</div>
      {actions && <div className='flex shrink-0 items-center gap-1'>{actions}</div>}
    </div>
  </header>
)

export default Navbar
