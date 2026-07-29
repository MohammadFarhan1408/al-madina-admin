import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

import classnames from 'classnames'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  helperText?: string
  startAdornment?: ReactNode
  endAdornment?: ReactNode
  containerClassName?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, startAdornment, endAdornment, containerClassName, className, id, ...props }, ref) => {
    const inputId = id ?? props.name

    return (
      <div className={classnames('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className='text-sm font-medium text-textPrimary'>
            {label}
          </label>
        )}
        <div
          className={classnames(
            'flex items-center gap-2 rounded-md border bg-backgroundPaper px-3 transition-colors',
            'focus-within:ring-2 focus-within:ring-primary/40',
            error ? 'border-error' : 'border-secondary/30 focus-within:border-primary'
          )}
        >
          {startAdornment}
          <input
            ref={ref}
            id={inputId}
            className={classnames(
              'h-10 w-full bg-transparent text-sm text-textPrimary placeholder:text-textDisabled outline-none disabled:opacity-50',
              className
            )}
            {...props}
          />
          {endAdornment}
        </div>
        {(error || helperText) && (
          <span className={classnames('text-xs', error ? 'text-error' : 'text-textSecondary')}>{error ?? helperText}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
