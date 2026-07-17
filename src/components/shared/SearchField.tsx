'use client'

// Shared search input: icon, clear button, and built-in debounce. Replaces the
// ad-hoc search fields that were previously reimplemented per page.
import { useEffect, useState } from 'react'

import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

import CustomTextField from '@core/components/mui/TextField'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  size?: 'small' | 'medium'
  fullWidth?: boolean
  className?: string
}

const SearchField = ({
  value,
  onChange,
  placeholder = 'Search…',
  debounceMs = 400,
  size = 'small',
  fullWidth,
  className
}: SearchFieldProps) => {
  const [draft, setDraft] = useState(value)
  const debounced = useDebouncedValue(draft, debounceMs)

  useEffect(() => {
    setDraft(value)

    // Only resync when the controlled value changes externally (e.g. cleared by a parent reset).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    if (debounced !== value) onChange(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  return (
    <CustomTextField
      size={size}
      fullWidth={fullWidth}
      className={className}
      placeholder={placeholder}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position='start'>
              <i className='tabler-search text-[20px] text-textSecondary' />
            </InputAdornment>
          ),
          endAdornment: draft ? (
            <InputAdornment position='end'>
              <IconButton
                size='small'
                aria-label='Clear search'
                onClick={() => {
                  setDraft('')
                  onChange('')
                }}
              >
                <i className='tabler-x text-[16px]' />
              </IconButton>
            </InputAdornment>
          ) : undefined
        }
      }}
    />
  )
}

export default SearchField
