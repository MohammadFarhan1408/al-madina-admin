'use client'

// Enter-to-navigate product search shown in the navbar. Uses the shared
// SearchField with debouncing off, so the icon, clear button and Escape
// behaviour come from the same place as the per-page list filters rather than
// being re-implemented here.

import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import classnames from 'classnames'

import SearchField from '@/components/shared/SearchField'

type NavbarSearchProps = {
  className?: string
}

const NavbarSearch = ({ className }: NavbarSearchProps) => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [modKey, setModKey] = useState('⌘')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // The hint has to name the key that actually works, and the platform is
    // only knowable on the client — rendering it during SSR would mismatch.
    if (!navigator.userAgent.includes('Mac')) setModKey('Ctrl ')

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className={classnames('group relative', className)}>
      <SearchField
        ref={inputRef}
        value={query}
        onChange={setQuery}
        debounceMs={0}
        onSubmit={trimmed => router.push(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : '/products')}
        placeholder='Search products…'
        inputSize='md'
        tone='subtle'

        // A pill needs more of a horizontal inset than a rectangle, or the icon
        // sits in the curve. `!` because these collide with the base control.
        controlClassName='rounded-full! px-4!'
        fullWidth
      />
      {/* Fades out on focus and is dropped once there's a query, so it never
          collides with the clear button or sits under the text being typed. */}
      {!query && (
        <kbd
          aria-hidden
          className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border px-1.5 py-0.5 font-sans text-[11px] font-medium leading-4 text-textMuted transition-opacity duration-150 group-focus-within:opacity-0 max-sm:hidden'
        >
          {modKey}K
        </kbd>
      )}
    </div>
  )
}

export default NavbarSearch
