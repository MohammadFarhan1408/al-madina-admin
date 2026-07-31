'use client'

import { useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole
} from '@floating-ui/react'
import classnames from 'classnames'

import Field, { controlBase, controlHeight, controlState, controlTone } from './Field'
import IconButton from '../IconButton'
import { PopoverMessage, PopoverOption, popoverSurface } from '../Popover'
import Spinner from '../Spinner'

export type SearchSelectProps<T> = {
  label?: ReactNode
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
  placeholder?: string
  required?: boolean
  error?: string
  helperText?: ReactNode
  disabled?: boolean
  containerClassName?: string
}

/** Single-select typeahead — the caller owns the (usually async) option list.
 *
 *  Arrow keys drive a virtual cursor while focus stays in the input, Enter
 *  commits the active option and Escape dismisses. The spinner lives inside
 *  the field rather than replacing the list, so an in-flight query doesn't
 *  blank out results the user is still reading. */
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
  placeholder = 'Type to search…',
  required,
  error,
  helperText,
  disabled = false,
  containerClassName
}: SearchSelectProps<T>) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const listRef = useRef<(HTMLElement | null)[]>([])
  const inputId = useId()
  const listId = `${inputId}-listbox`

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${Math.min(availableHeight - 8, 320)}px`
          })
        }
      })
    ]
  })

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    useDismiss(context),
    useRole(context, { role: 'listbox' }),
    useListNavigation(context, {
      listRef,
      activeIndex,
      onNavigate: setActiveIndex,
      virtual: true,
      loop: true
    })
  ])

  const inputValue = value ? getOptionLabel(value) : query

  const select = (option: T) => {
    onChange(option)
    setQuery('')
    setActiveIndex(null)
    setOpen(false)
  }

  const clear = () => {
    onChange(null)
    setQuery('')
    onInputChange('')
    setActiveIndex(null)
  }

  const t = controlTone.light

  return (
    <Field
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      htmlFor={inputId}
      asLabel
      className={containerClassName}
    >
      <div
        ref={refs.setReference}
        className={classnames(
          controlBase,
          controlHeight,
          'px-3',
          t.idle,
          controlState(Boolean(error), true),
          disabled && 'pointer-events-none opacity-60'
        )}
      >
        <i aria-hidden className='tabler-search shrink-0 text-[18px] text-textMuted' />
        <input
          {...getReferenceProps({
            id: inputId,
            value: inputValue,
            disabled,
            placeholder,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': error || helperText ? `${inputId}-message` : undefined,
            'aria-controls': open ? listId : undefined,
            onChange: e => {
              const next = (e.target as HTMLInputElement).value

              if (value) onChange(null)
              setQuery(next)
              onInputChange(next)
              setOpen(true)
            },
            onFocus: () => setOpen(true),
            onKeyDown: e => {
              if (e.key === 'Enter' && activeIndex !== null && options[activeIndex]) {
                e.preventDefault()
                select(options[activeIndex])
              }
            },
            className: classnames('h-full min-w-0 flex-1 bg-transparent text-sm outline-none', t.text, t.placeholder)
          })}
        />
        {loading && <Spinner size='sm' className='shrink-0' />}
        {!loading && (value || query) && (
          <IconButton size='sm' aria-label='Clear selection' onClick={clear} className='-mr-1'>
            <i className='tabler-x' />
          </IconButton>
        )}
      </div>
      {open && (
        <div
          {...getFloatingProps({
            ref: refs.setFloating,
            id: listId,

            // Hidden until measured — otherwise it paints one frame in the
            // top-left corner before it is moved under the input.
            style: { ...floatingStyles, opacity: isPositioned ? 1 : 0 },
            className: popoverSurface
          })}
        >
          {loading && options.length === 0 ? (
            <PopoverMessage>Searching…</PopoverMessage>
          ) : options.length === 0 ? (
            <PopoverMessage>{emptyText}</PopoverMessage>
          ) : (
            options.map((option, index) => (
              <PopoverOption
                key={getOptionKey(option)}
                {...getItemProps({
                  ref(node: HTMLButtonElement | null) {
                    listRef.current[index] = node
                  },
                  onClick: () => select(option)
                })}
                role='option'
                showCheck
                selected={Boolean(value) && getOptionKey(option) === getOptionKey(value as T)}
                active={activeIndex === index}
                tabIndex={-1}
              >
                {renderOption ? renderOption(option) : getOptionLabel(option)}
              </PopoverOption>
            ))
          )}
        </div>
      )}
    </Field>
  )
}

export default SearchSelect
