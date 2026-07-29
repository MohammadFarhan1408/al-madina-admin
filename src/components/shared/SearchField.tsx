'use client'

// Shared search input: icon, clear button, and built-in debounce. Replaces the
// ad-hoc search fields that were previously reimplemented per page.
import { useEffect, useState } from 'react'

import Input from '@/components/ui/Input'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  fullWidth?: boolean
  className?: string
}

const SearchField = ({ value, onChange, placeholder = 'Search…', debounceMs = 400, fullWidth, className }: SearchFieldProps) => {
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
    <Input
      containerClassName={fullWidth ? `w-full ${className ?? ''}` : className}
      placeholder={placeholder}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      startAdornment={<i className='tabler-search text-[20px] text-textSecondary' />}
      endAdornment={
        draft ? (
          <button
            type='button'
            aria-label='Clear search'
            onClick={() => {
              setDraft('')
              onChange('')
            }}
            className='rounded p-1 hover:bg-black/5'
          >
            <i className='tabler-x text-[16px]' />
          </button>
        ) : undefined
      }
    />
  )
}

export default SearchField
