'use client'

// The navbar's search box is a trigger: it opens the command palette (also
// reachable with ⌘K / Ctrl+K, wired in DashboardShell). A real input here would
// duplicate the palette's, and could only search one thing.

import { useEffect, useState } from 'react'

import classnames from 'classnames'

type NavbarSearchProps = {
  onOpen: () => void
  className?: string
}

const NavbarSearch = ({ onOpen, className }: NavbarSearchProps) => {
  const [modKey, setModKey] = useState('⌘')

  // The hint has to name the key that actually works, and the platform is only
  // knowable on the client — rendering it during SSR would mismatch.
  useEffect(() => {
    if (!navigator.userAgent.includes('Mac')) setModKey('Ctrl ')
  }, [])

  return (
    <button
      type='button'
      aria-haspopup='dialog'
      aria-label='Search pages, products, orders and customers'
      onClick={onOpen}
      className={classnames(
        'flex h-10 w-full items-center gap-2 rounded-full border border-border bg-backgroundPaper px-4 pointer-coarse:h-11',
        'text-left text-sm text-textMuted transition-colors hover:border-borderStrong',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        className
      )}
    >
      <i aria-hidden className='tabler-search text-[18px]' />
      <span className='min-w-0 flex-1 truncate'>Search…</span>
      <kbd
        aria-hidden
        className='rounded-md border border-border px-1.5 py-0.5 font-sans text-[11px] font-medium leading-4 max-sm:hidden'
      >
        {modKey}K
      </kbd>
    </button>
  )
}

export default NavbarSearch
