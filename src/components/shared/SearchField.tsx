'use client'

// The one search input. Icon, clear affordance, optional debounce and an
// Enter-to-submit mode — so the debounced list filters and the navbar's
// submit-on-Enter product search share a single implementation instead of each
// re-creating the icon and clear button.

import { forwardRef, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import IconButton from '@/components/ui/IconButton'
import Input, { type InputSize, type InputTone } from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string

  /** Set to 0 to report every keystroke immediately (for submit-on-Enter use). */
  debounceMs?: number

  /** Called on Enter. Provide for search fields that navigate rather than filter. */
  onSubmit?: (value: string) => void

  /** Shows a spinner in place of the clear button while a query is in flight. */
  loading?: boolean
  inputSize?: InputSize

  /** 'subtle' for search that lives in chrome (navbar, toolbars). */
  tone?: InputTone
  label?: string
  fullWidth?: boolean

  /** Classes for the bordered box itself — see `Input.controlClassName`. */
  controlClassName?: string
  className?: string
}

const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Search…',
      debounceMs = 400,
      onSubmit,
      loading = false,
      inputSize = 'md',
      tone = 'light',
      label,
      fullWidth,
      controlClassName,
      className
    },
    ref
  ) => {
    const [draft, setDraft] = useState(value)
    const debounced = useDebouncedValue(draft, debounceMs)
    const innerRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      setDraft(value)

      // Only resync when the controlled value changes externally (e.g. cleared by a parent reset).
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    useEffect(() => {
      if (debounced !== value) onChange(debounced)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced])

    const clear = () => {
      setDraft('')
      onChange('')
      innerRef.current?.focus()
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSubmit) {
        e.preventDefault()
        onSubmit(draft.trim())
      }

      // Escape clears rather than blurring — the shortcut users expect from a
      // search box, and it keeps focus available for the next query.
      if (e.key === 'Escape' && draft) {
        e.preventDefault()
        clear()
      }
    }

    return (
      <Input
        ref={node => {
          innerRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        type='search'
        role='searchbox'
        label={label}
        aria-label={label ? undefined : placeholder}
        inputSize={inputSize}
        tone={tone}
        controlClassName={controlClassName}
        containerClassName={fullWidth ? `w-full ${className ?? ''}` : className}
        placeholder={placeholder}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        startAdornment={<i className='tabler-search' />}
        endAdornment={
          loading ? (
            <Spinner size='sm' className='mr-1.5' label={null} />
          ) : draft ? (
            <IconButton size='sm' aria-label='Clear search' onClick={clear}>
              <i className='tabler-x' />
            </IconButton>
          ) : undefined
        }
      />
    )
  }
)

SearchField.displayName = 'SearchField'

export default SearchField
