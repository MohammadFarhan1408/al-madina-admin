'use client'

// Enter-to-navigate product search shared by both navbar layouts (vertical +
// horizontal). Distinct from the shared `SearchField` (which live-filters via
// debounce) — this one submits on Enter and routes to /products?q=.
import { useState, type KeyboardEvent } from 'react'

import { useRouter } from 'next/navigation'

import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

import CustomTextField from '@core/components/mui/TextField'

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
    <CustomTextField
      size='small'
      placeholder='Search products…'
      value={query}
      onChange={e => setQuery(e.target.value)}
      onKeyDown={handleKeyDown}
      className={className}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position='start'>
              <i className='tabler-search text-textSecondary' />
            </InputAdornment>
          ),
          endAdornment: query ? (
            <InputAdornment position='end'>
              <IconButton size='small' aria-label='Clear search' onClick={() => setQuery('')}>
                <i className='tabler-x text-[16px]' />
              </IconButton>
            </InputAdornment>
          ) : undefined
        }
      }}
    />
  )
}

export default NavbarSearch
