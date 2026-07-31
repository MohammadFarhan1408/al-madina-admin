'use client'

import { forwardRef, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

import { autoUpdate, flip, offset, shift, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react'

import Calendar from '../Calendar'
import { popoverSurface } from '../Popover'
import IconButton from '../IconButton'
import Input, { type InputProps } from './Input'

export type DateInputProps = Omit<InputProps, 'type' | 'endAdornment' | 'startAdornment'> & {

  /** `time` and `datetime-local` keep the native picker — only `date` (the
   *  only type actually used in the app) gets the custom calendar. */
  type?: 'date' | 'time' | 'datetime-local' | 'month'

  /** Show a clear affordance once a value is set — useful for date *filters*,
   *  where "no date" is a meaningful state. Off for required form fields. */
  clearable?: boolean
}

const iconFor: Record<NonNullable<DateInputProps['type']>, string> = {
  date: 'tabler-calendar',
  'datetime-local': 'tabler-calendar-clock',
  month: 'tabler-calendar-month',
  time: 'tabler-clock'
}

const formatDisplay = (value?: unknown) => {
  if (typeof value !== 'string' || !value) return ''
  const [y, m, d] = value.split('-').map(Number)

  if (!y || !m || !d) return ''

  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Date field with a custom calendar popover — replaces the browser's native
 *  calendar, whose look drifts across Chrome/Safari/Firefox and can't be
 *  themed to match the rest of the system.
 *
 *  Keeps the `value`/`onChange` contract of a native `<input type="date">` (a
 *  `YYYY-MM-DD` string via `e.target.value`), so both plain `useState`
 *  callers and react-hook-form's `{...field}` spread work unchanged — only
 *  the event is synthesized rather than coming from a real DOM node, since
 *  there is no native date input backing this control anymore. */
const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ type = 'date', clearable = false, value, onChange, disabled, min, max, ...props }, ref) => {
    const nativeRef = useRef<HTMLInputElement>(null)
    const [open, setOpen] = useState(false)
    const isEmpty = value === '' || value === undefined || value === null
    const showClear = clearable && !isEmpty && !disabled

    const { refs, floatingStyles, context, isPositioned } = useFloating({
      open,
      onOpenChange: setOpen,
      placement: 'bottom-start',
      whileElementsMounted: autoUpdate,
      middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })]
    })

    const { getReferenceProps, getFloatingProps } = useInteractions([
      useDismiss(context),
      useRole(context, { role: 'dialog' })
    ])

    const emit = (next: string) => onChange?.({ target: { value: next } } as ChangeEvent<HTMLInputElement>)

    if (type !== 'date') {
      const openPicker = () => {
        const el = nativeRef.current

        if (!el) return
        el.focus()

        try {
          el.showPicker?.()
        } catch {
          // Some browsers reject showPicker() outside a trusted gesture chain —
          // the field is focused and typeable either way.
        }
      }

      return (
        <Input
          ref={node => {
            nativeRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          min={min}
          max={max}
          data-empty={isEmpty}
          className='[&::-webkit-datetime-edit]:leading-none'
          endAdornment={
            <span className='flex items-center'>
              {showClear && (
                <IconButton size='sm' aria-label='Clear date' onClick={() => emit('')}>
                  <i className='tabler-x' />
                </IconButton>
              )}
              <IconButton size='sm' disabled={disabled} aria-label='Open time picker' onClick={openPicker}>
                <i className={iconFor[type]} />
              </IconButton>
            </span>
          }
          {...props}
        />
      )
    }

    return (
      <>
        <Input
          ref={node => {
            refs.setReference(node)
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          {...getReferenceProps({
            type: 'text',
            readOnly: true,
            value: formatDisplay(value),
            placeholder: 'mm/dd/yyyy',
            disabled,
            onClick: () => !disabled && setOpen(true),
            onKeyDown: e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                if (!disabled) setOpen(true)
              }
            }
          })}
          className='cursor-pointer caret-transparent'
          data-empty={isEmpty}
          endAdornment={
            <span className='flex items-center'>
              {showClear && (
                <IconButton
                  size='sm'
                  aria-label='Clear date'
                  onClick={e => {
                    e.stopPropagation()
                    emit('')
                  }}
                >
                  <i className='tabler-x' />
                </IconButton>
              )}
              <IconButton
                size='sm'
                disabled={disabled}
                aria-label='Open calendar'
                onClick={() => !disabled && setOpen(o => !o)}
              >
                <i className={iconFor.date} />
              </IconButton>
            </span>
          }
          {...props}
        />
        {open && (
          <div
            {...getFloatingProps({
              ref: refs.setFloating,
              style: { ...floatingStyles, opacity: isPositioned ? 1 : 0 },
              className: popoverSurface
            })}
          >
            <Calendar
              value={typeof value === 'string' ? value : undefined}
              min={typeof min === 'string' ? min : undefined}
              max={typeof max === 'string' ? max : undefined}
              onSelect={next => {
                emit(next)
                setOpen(false)
              }}
              onClear={
                clearable
                  ? () => {
                      emit('')
                      setOpen(false)
                    }
                  : undefined
              }
            />
          </div>
        )}
      </>
    )
  }
)

DateInput.displayName = 'DateInput'

export default DateInput
