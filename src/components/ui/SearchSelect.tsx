'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { autoUpdate, flip, offset, shift, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react'
import classnames from 'classnames'

export type SearchSelectProps<T> = {
  label?: string
  options: T[]
  value: T | null
  onChange: (next: T | null) => void
  onInputChange: (query: string) => void
  getOptionLabel: (option: T) => string
  getOptionKey: (option: T) => string

  /** Rich per-option markup; falls back to the plain label. */
  renderOption?: (option: T) => ReactNode
  loading?: boolean
  emptyText?: string
  containerClassName?: string
}

/** Single-select typeahead — the caller owns the (usually async) option list. */
const SearchSelect = <T,>({
  label,
  options,
  value,
  onChange,
  onInputChange,
  getOptionLabel,
  getOptionKey,
  renderOption,
  loading = false,
  emptyText = 'No matches',
  containerClassName
}: SearchSelectProps<T>) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip(), shift({ padding: 8 })]
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([useDismiss(context), useRole(context, { role: 'listbox' })])

  const inputValue = value ? getOptionLabel(value) : query

  return (
    <div className={classnames('flex flex-col gap-1.5', containerClassName)}>
      {label && <span className='text-sm font-medium text-textPrimary'>{label}</span>}
      <div
        ref={refs.setReference}
        className='flex items-center gap-2 rounded-md border border-secondary/30 bg-backgroundPaper px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40'
      >
        <input
          {...getReferenceProps()}
          value={inputValue}
          onChange={e => {
            if (value) onChange(null)
            setQuery(e.target.value)
            onInputChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          className='h-10 w-full bg-transparent text-sm text-textPrimary outline-none placeholder:text-textDisabled'
        />
        {value && (
          <button
            type='button'
            aria-label='Clear selection'
            onClick={() => {
              onChange(null)
              setQuery('')
              onInputChange('')
            }}
            className='text-textSecondary hover:text-error'
          >
            <i className='tabler-x text-[16px]' />
          </button>
        )}
      </div>
      {open && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className='z-50 max-h-72 overflow-auto rounded-md border border-secondary/30 bg-backgroundPaper py-1 shadow-lg'
        >
          {loading ? (
            <p className='px-3 py-2 text-sm text-textSecondary'>Searching…</p>
          ) : options.length === 0 ? (
            <p className='px-3 py-2 text-sm text-textSecondary'>{emptyText}</p>
          ) : (
            options.map(option => (
              <button
                key={getOptionKey(option)}
                type='button'
                role='option'
                aria-selected={Boolean(value) && getOptionKey(option) === getOptionKey(value as T)}
                onClick={() => {
                  onChange(option)
                  setQuery('')
                  setOpen(false)
                }}
                className='block w-full px-3 py-2 text-left text-sm text-textPrimary hover:bg-primary/10'
              >
                {renderOption ? renderOption(option) : getOptionLabel(option)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default SearchSelect
