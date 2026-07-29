import type { ReactNode } from 'react'

import classnames from 'classnames'

export type NavbarProps = {
  onMenuToggle?: () => void
  actions?: ReactNode
  className?: string
}

const Navbar = ({ onMenuToggle, actions, className }: NavbarProps) => (
  <header
    className={classnames(
      'sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-secondary/20 bg-backgroundPaper/95 px-4 backdrop-blur',
      className
    )}
  >
    {onMenuToggle && (
      <button type='button' onClick={onMenuToggle} aria-label='Toggle menu' className='rounded-md p-2 hover:bg-primary/10 lg:hidden'>
        <i className='tabler-menu-2 text-xl' />
      </button>
    )}
    <div className='flex-1' />
    <div className='flex items-center gap-2'>{actions}</div>
  </header>
)

export default Navbar
