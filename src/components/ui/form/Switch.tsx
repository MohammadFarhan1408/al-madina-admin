'use client'

import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

import classnames from 'classnames'

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode
  description?: ReactNode

  /** Put the toggle after the label, filling the row — for settings rows where
   *  the control belongs on the right edge. */
  reverse?: boolean
}

/** Checkbox input styled as a track+knob toggle, so it stays keyboard- and
 *  form-native; `role='switch'` makes screen readers announce on/off. The knob translates rather than
 *  animating layout, and the track carries the state colour. */
const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, reverse = false, className, id, ...props }, ref) => {
    const reactId = useId()
    const switchId = id ?? reactId

    return (
      <label
        htmlFor={switchId}
        className={classnames(
          'group inline-flex items-center gap-3 pointer-coarse:min-h-11 select-none',
          reverse && 'w-full justify-between',
          props.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          className
        )}
      >
        {label && (
          <span className={classnames('flex min-w-0 flex-col gap-0.5', reverse && 'order-first')}>
            <span className='text-sm leading-5 text-textPrimary'>{label}</span>
            {description && <span className='text-xs leading-4 text-textMuted'>{description}</span>}
          </span>
        )}
        <span className='relative inline-flex shrink-0 items-center'>
          <input ref={ref} type='checkbox' role='switch' id={switchId} className='peer sr-only' {...props} />
          <span
            aria-hidden
            className={classnames(
              'block h-5 w-9 rounded-full border border-borderControl bg-surfaceSunken transition-colors',
              'group-hover:bg-surfaceSunken/60 peer-checked:border-transparent peer-checked:bg-primaryDark peer-checked:group-hover:bg-primaryInk',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-focus-visible:ring-offset-2'
            )}
          />
          <span
            aria-hidden
            className='pointer-events-none absolute left-0.5 size-4 rounded-full bg-white shadow-xs transition-transform duration-150 ease-out-quart peer-checked:translate-x-4'
          />
        </span>
      </label>
    )
  }
)

Switch.displayName = 'Switch'

export default Switch
