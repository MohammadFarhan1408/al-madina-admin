'use client'

// Enter-to-navigate product search shown in the navbar. Distinct from the
// shared `SearchField` (which live-filters via debounce) — this one submits
// on Enter and routes to /products?q=.
import { useState, type KeyboardEvent } from 'react'

import { useRouter } from 'next/navigation'

import Input from '@/components/ui/Input'

type NavbarSearchProps = {
  className?: string
}

const NavbarSearch = ({ className }: NavbarSearchProps) => {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const runSearch = () => {
    const trimmed = query.trim()

    router.push(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : '/products')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') runSearch()
  }

  return (
    <Input
      placeholder='Search products…'
      value={query}
      onChange={e => setQuery(e.target.value)}
      onKeyDown={handleKeyDown}
      containerClassName={className}
      startAdornment={<i className='tabler-search text-textSecondary' />}
      endAdornment={
        query ? (
          <button type='button' aria-label='Clear search' onClick={() => setQuery('')} className='rounded p-1 hover:bg-black/5'>
            <i className='tabler-x text-[16px]' />
          </button>
        ) : undefined
      }
    />
  )
}

export default NavbarSearch
