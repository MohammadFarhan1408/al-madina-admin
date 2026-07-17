'use client'

// React Imports
import { useState, type KeyboardEvent } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'

// MUI Imports
import InputAdornment from '@mui/material/InputAdornment'

// Component Imports
import NavToggle from './NavToggle'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const NavbarContent = () => {
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
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-4 flex-1'>
        <NavToggle />
        <CustomTextField
          size='small'
          placeholder='Search products…'
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className='max-is-[320px] is-full hidden sm:block'
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='tabler-search text-textSecondary' />
                </InputAdornment>
              )
            }
          }}
        />
        <ModeDropdown />
      </div>
      <div className='flex items-center'>
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
