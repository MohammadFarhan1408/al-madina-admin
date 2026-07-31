'use client'

import { forwardRef, useRef } from 'react'

import IconButton from './IconButton'
import Input, { type InputProps } from './Input'

export type DateInputProps = Omit<InputProps, 'type' | 'endAdornment' | 'startAdornment'> & {

  /** `time` and `datetime-local` share the same styling and picker plumbing. */
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

/** Date/time field that keeps the native control — and therefore the OS
 *  picker, locale-aware segment order, and mobile date wheels — but replaces
 *  the browser's mismatched calendar glyph with a trigger styled like the rest
 *  of the system.
 *
 *  `showPicker()` opens the same native calendar the removed indicator would
 *  have; where it isn't available the button just focuses the field, which
 *  remains fully typeable. */
const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ type = 'date', clearable = false, value, onChange, disabled, ...props }, ref) => {
    const innerRef = useRef<HTMLInputElement>(null)
    const isEmpty = value === '' || value === undefined || value === null
    const showClear = clearable && !isEmpty && !disabled

    const openPicker = () => {
      const el = innerRef.current

      if (!el) return

      el.focus()

      try {
        el.showPicker?.()
      } catch {
        // Some browsers reject showPicker() outside a trusted gesture chain —
        // the field is focused and typeable either way.
      }
    }

    // Clear by driving the DOM node the way a user would, then dispatching a
    // real `input` event. React's onChange is delegated from that event, so
    // both plain useState callers and react-hook-form see an ordinary change
    // with an empty value — no synthetic-event forgery.
    const clear = () => {
      const el = innerRef.current

      if (!el) return

      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set

      setter?.call(el, '')
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.focus()
    }

    return (
      <Input
        ref={node => {
          innerRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        data-empty={isEmpty}
        className='[&::-webkit-datetime-edit]:leading-none'
        endAdornment={
          <span className='flex items-center'>
            {showClear && (
              <IconButton size='sm' aria-label='Clear date' onClick={clear}>
                <i className='tabler-x' />
              </IconButton>
            )}
            <IconButton
              size='sm'
              disabled={disabled}
              aria-label={type === 'time' ? 'Open time picker' : 'Open calendar'}
              onClick={openPicker}
            >
              <i className={iconFor[type]} />
            </IconButton>
          </span>
        }
        {...props}
      />
    )
  }
)

DateInput.displayName = 'DateInput'

export default DateInput
