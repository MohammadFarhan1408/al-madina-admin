import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

import classnames from 'classnames'

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, className, id, ...props }, ref) => {
  const checkboxId = id ?? props.name

  return (
    <label htmlFor={checkboxId} className='inline-flex items-center gap-2 cursor-pointer select-none'>
      <input
        ref={ref}
        type='checkbox'
        id={checkboxId}
        className={classnames(
          'size-4 rounded border-secondary/40 text-primary accent-primary focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50',
          className
        )}
        {...props}
      />
      {label && <span className='text-sm text-textPrimary'>{label}</span>}
    </label>
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox
