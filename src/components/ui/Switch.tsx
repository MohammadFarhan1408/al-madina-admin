import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

import classnames from 'classnames'

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
}

// Checkbox input styled as a track+knob toggle, so it stays keyboard- and
// form-native (no ARIA role juggling).
const Switch = forwardRef<HTMLInputElement, SwitchProps>(({ label, className, id, ...props }, ref) => {
  const switchId = id ?? props.name

  return (
    <label htmlFor={switchId} className='inline-flex cursor-pointer select-none items-center gap-2'>
      <span className='relative inline-flex'>
        <input ref={ref} type='checkbox' id={switchId} className={classnames('peer sr-only', className)} {...props} />
        <span className='block h-6 w-10 rounded-full bg-textDisabled/40 transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-disabled:opacity-50' />
        <span className='pointer-events-none absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4' />
      </span>
      {label && <span className='text-sm text-textPrimary'>{label}</span>}
    </label>
  )
})

Switch.displayName = 'Switch'

export default Switch
