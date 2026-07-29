'use client'

import { useMemo, useState } from 'react'
import type { KeyboardEvent } from 'react'

import { autoUpdate, flip, offset, shift, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react'
import classnames from 'classnames'

export type ComboboxProps<T> = {
  label?: string
  options: T[]
  value: T[]
  onChange: (next: T[]) => void
  getOptionLabel?: (option: T) => string
  isOptionEqualToValue?: (a: T, b: T) => boolean
  /** Allow adding typed text as a new value even if it's not in `options`. */
  freeSolo?: boolean
  placeholder?: string
  containerClassName?: string
}

const defaultGetLabel = (option: unknown) => String(option)
const defaultIsEqual = <T,>(a: T, b: T) => a === b

// Anchored popover + keyboard nav — same shape as Dropdown, but with a text
// input as the reference element instead of a trigger button.
const Combobox = <T,>({
  label,
  options,
  value,
  onChange,
  getOptionLabel = defaultGetLabel as (option: T) => string,
  isOptionEqualToValue = defaultIsEqual,
  freeSolo = false,
  placeholder,
  containerClassName
}: ComboboxProps<T>) => {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip(), shift({ padding: 8 })]
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useDismiss(context),
    useRole(context, { role: 'listbox' })
  ])

  const filteredOptions = useMemo(() => {
    const notSelected = options.filter(option => !value.some(v => isOptionEqualToValue(v, option)))

    if (!inputValue) return notSelected

    return notSelected.filter(option => getOptionLabel(option).toLowerCase().includes(inputValue.toLowerCase()))
  }, [options, value, inputValue, getOptionLabel, isOptionEqualToValue])

  const addValue = (next: T) => {
    onChange([...value, next])
    setInputValue('')
  }

  const removeValue = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && freeSolo && inputValue.trim()) {
      e.preventDefault()
      addValue(inputValue.trim() as unknown as T)
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeValue(value.length - 1)
    }
  }

  return (
    <div className={classnames('flex flex-col gap-1.5', containerClassName)}>
      {label && <span className='text-sm font-medium text-textPrimary'>{label}</span>}
      <div
        ref={refs.setReference}
        className='flex flex-wrap items-center gap-1.5 rounded-md border border-secondary/30 bg-backgroundPaper px-2 py-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40'
      >
        {value.map((option, index) => (
          <span key={index} className='inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primaryDark'>
            {getOptionLabel(option)}
            <button type='button' aria-label='Remove' onClick={() => removeValue(index)} className='hover:text-error'>
              <i className='tabler-x text-xs' />
            </button>
          </span>
        ))}
        <input
          {...getReferenceProps()}
          value={inputValue}
          placeholder={value.length === 0 ? placeholder : undefined}
          onChange={e => {
            setInputValue(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className='min-w-[6rem] flex-1 bg-transparent py-1 text-sm text-textPrimary outline-none placeholder:text-textDisabled'
        />
      </div>
      {open && filteredOptions.length > 0 && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className='z-50 max-h-60 overflow-auto rounded-md border border-secondary/30 bg-backgroundPaper py-1 shadow-lg'
        >
          {filteredOptions.map((option, index) => (
            <button
              key={index}
              type='button'
              role='option'
              onClick={() => addValue(option)}
              className='block w-full px-3 py-2 text-left text-sm text-textPrimary hover:bg-primary/10'
            >
              {getOptionLabel(option)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Combobox
