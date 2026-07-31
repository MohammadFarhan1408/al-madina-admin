'use client'

import { useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'

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

import Field, { controlBase, controlState, controlTone } from './Field'
import IconButton from './IconButton'
import { PopoverMessage, PopoverOption, popoverSurface } from './Popover'

export type ComboboxProps<T> = {
  label?: ReactNode
  options: T[]
  value: T[]
  onChange: (next: T[]) => void
  getOptionLabel?: (option: T) => string
  isOptionEqualToValue?: (a: T, b: T) => boolean

  /** Allow adding typed text as a new value even if it's not in `options`. */
  freeSolo?: boolean
  placeholder?: string
  required?: boolean
  error?: string
  helperText?: ReactNode
  disabled?: boolean
  containerClassName?: string
}

const defaultGetLabel = (option: unknown) => String(option)
const defaultIsEqual = <T,>(a: T, b: T) => a === b

/** Multi-select token input with an anchored, keyboard-navigable listbox.
 *
 *  Arrow keys move a virtual cursor via floating-ui's `useListNavigation`
 *  (`aria-activedescendant`), so focus never leaves the text input — the
 *  pattern the WAI-ARIA combobox spec calls for. Enter commits the active
 *  option, Backspace on an empty input removes the last token. */
const Combobox = <T,>({
  label,
  options,
  value,
  onChange,
  getOptionLabel = defaultGetLabel as (option: T) => string,
  isOptionEqualToValue = defaultIsEqual,
  freeSolo = false,
  placeholder,
  required,
  error,
  helperText,
  disabled = false,
  containerClassName
}: ComboboxProps<T>) => {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
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
            maxHeight: `${Math.min(availableHeight - 8, 288)}px`
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

  const filteredOptions = useMemo(() => {
    const notSelected = options.filter(option => !value.some(v => isOptionEqualToValue(v, option)))

    if (!inputValue) return notSelected

    return notSelected.filter(option => getOptionLabel(option).toLowerCase().includes(inputValue.toLowerCase()))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, value, inputValue])

  const addValue = (next: T) => {
    onChange([...value, next])
    setInputValue('')
    setActiveIndex(null)
  }

  const removeValue = (index: number) => onChange(value.filter((_, i) => i !== index))

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (activeIndex !== null && filteredOptions[activeIndex]) {
        e.preventDefault()
        addValue(filteredOptions[activeIndex])

        return
      }

      if (freeSolo && inputValue.trim()) {
        e.preventDefault()
        addValue(inputValue.trim() as unknown as T)
      }

      return
    }

    if (e.key === ',' && freeSolo && inputValue.trim()) {
      e.preventDefault()
      addValue(inputValue.trim() as unknown as T)

      return
    }

    if (e.key === 'Backspace' && !inputValue && value.length > 0) removeValue(value.length - 1)
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
          'min-h-10 flex-wrap items-center gap-1.5 px-2 py-1.5',
          t.idle,
          controlState(Boolean(error), true),
          disabled && 'pointer-events-none opacity-60'
        )}
      >
        {value.map((option, index) => (
          <span
            key={`${getOptionLabel(option)}-${index}`}
            className='inline-flex max-w-full items-center gap-1 rounded-md bg-primary/14 py-0.5 pl-2 pr-1 text-xs font-medium text-primaryInk'
          >
            <span className='truncate'>{getOptionLabel(option)}</span>
            <IconButton
              size='sm'
              color='primary'
              aria-label={`Remove ${getOptionLabel(option)}`}
              onClick={() => removeValue(index)}
              className='size-4 text-[12px] hover:bg-error/15 hover:text-error'
            >
              <i className='tabler-x' />
            </IconButton>
          </span>
        ))}
        <input
          {...getReferenceProps({
            id: inputId,
            value: inputValue,
            disabled,
            placeholder: value.length === 0 ? placeholder : undefined,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': error || helperText ? `${inputId}-message` : undefined,
            'aria-controls': open ? listId : undefined,
            onChange: e => {
              setInputValue((e.target as HTMLInputElement).value)
              setOpen(true)
            },
            onFocus: () => setOpen(true),
            onKeyDown: handleKeyDown,
            className: classnames('min-w-24 flex-1 bg-transparent py-0.5 text-sm outline-none', t.text, t.placeholder)
          })}
        />
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
          {filteredOptions.length === 0 ? (
            <PopoverMessage>{inputValue ? 'No matches' : 'No options left'}</PopoverMessage>
          ) : (
            filteredOptions.map((option, index) => (
              <PopoverOption
                key={`${getOptionLabel(option)}-${index}`}
                {...getItemProps({
                  ref(node: HTMLButtonElement | null) {
                    listRef.current[index] = node
                  },
                  onClick: () => addValue(option)
                })}
                role='option'
                active={activeIndex === index}
                tabIndex={-1}
              >
                {getOptionLabel(option)}
              </PopoverOption>
            ))
          )}
        </div>
      )}
    </Field>
  )
}

export default Combobox
