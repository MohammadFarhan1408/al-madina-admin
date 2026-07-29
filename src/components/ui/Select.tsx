import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'

import classnames from 'classnames'

export type SelectOption = {
  label: string
  value: string | number
}

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  containerClassName?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, containerClassName, className, id, ...props }, ref) => {
    const selectId = id ?? props.name

    return (
      <div className={classnames('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={selectId} className='text-sm font-medium text-textPrimary'>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={classnames(
            'h-10 w-full rounded-md border bg-backgroundPaper px-3 text-sm text-textPrimary transition-colors',
            'outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50',
            error ? 'border-error' : 'border-secondary/30 focus:border-primary',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value='' disabled={props.required}>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {(error || helperText) && (
          <span className={classnames('text-xs', error ? 'text-error' : 'text-textSecondary')}>{error ?? helperText}</span>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
