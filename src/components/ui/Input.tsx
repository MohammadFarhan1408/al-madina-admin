import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

import classnames from 'classnames'

export type InputTone = 'light' | 'dark'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  helperText?: string
  startAdornment?: ReactNode
  endAdornment?: ReactNode
  containerClassName?: string

  /** 'dark' targets the dark auth screens; default 'light' for dashboard surfaces. */
  tone?: InputTone
}

const toneClasses: Record<InputTone, { label: string; field: string; input: string; helper: string }> = {
  light: {
    label: 'text-textPrimary',
    field: 'bg-backgroundPaper border-secondary/30 focus-within:border-primary',
    input: 'text-textPrimary placeholder:text-textDisabled',
    helper: 'text-textSecondary'
  },
  dark: {
    label: 'text-stone',
    field: 'bg-white/5 border-primary/25 focus-within:border-primary',
    input: 'text-ivory caret-primary placeholder:text-stone',
    helper: 'text-stone'
  }
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, startAdornment, endAdornment, containerClassName, className, id, tone = 'light', ...props },
    ref
  ) => {
    const inputId = id ?? props.name
    const t = toneClasses[tone]

    return (
      <div className={classnames('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className={classnames('text-sm font-medium', t.label)}>
            {label}
          </label>
        )}
        <div
          className={classnames(
            'flex items-center gap-2 rounded-md border px-3 transition-colors focus-within:ring-2 focus-within:ring-primary/40',
            error ? 'border-error' : t.field
          )}
        >
          {startAdornment}
          <input
            ref={ref}
            id={inputId}
            className={classnames('h-10 w-full bg-transparent text-sm outline-none disabled:opacity-50', t.input, className)}
            {...props}
          />
          {endAdornment}
        </div>
        {(error || helperText) && (
          <span className={classnames('text-xs', error ? 'text-error' : t.helper)}>{error ?? helperText}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
