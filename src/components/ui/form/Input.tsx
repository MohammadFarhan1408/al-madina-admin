import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

import classnames from 'classnames'

import Field, { controlBase, controlState, controlTone, type FieldTone } from './Field'

export type InputTone = FieldTone
export type InputSize = 'sm' | 'md' | 'lg'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode
  error?: string
  helperText?: ReactNode

  /** Leading slot — an icon, or a static prefix such as `AED`. */
  startAdornment?: ReactNode

  /** Trailing slot — a unit, a clear button, a password reveal. */
  endAdornment?: ReactNode
  inputSize?: InputSize
  containerClassName?: string

  /** Classes for the control surface itself (the bordered box), for one-off
   *  geometry like a pill radius. Use `!` on anything that collides with the
   *  base — there is no tailwind-merge here, so plain classes would be settled
   *  by stylesheet order rather than by intent. */
  controlClassName?: string

  /** 'dark' targets the dark auth screens; default 'light' for dashboard surfaces. */
  tone?: InputTone
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'h-9 pointer-coarse:h-11 px-2.5',
  md: 'h-10 pointer-coarse:h-11 px-3',
  lg: 'h-11 px-3.5'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      startAdornment,
      endAdornment,
      containerClassName,
      controlClassName,
      className,
      id,
      inputSize = 'md',
      tone = 'light',
      required,
      ...props
    },
    ref
  ) => {
    const reactId = useId()
    const inputId = id ?? props.name ?? reactId
    const t = controlTone[tone]

    return (
      <Field
        label={label}
        required={required}
        error={error}
        helperText={helperText}
        tone={tone}
        htmlFor={inputId}
        className={containerClassName}
      >
        <div
          className={classnames(
            controlBase,
            sizeClasses[inputSize],
            t.idle,
            controlState(Boolean(error), true),
            controlClassName
          )}
        >
          {startAdornment && (
            <span
              className={classnames('flex shrink-0 items-center', tone === 'dark' ? 'text-stone' : 'text-textMuted')}
            >
              {startAdornment}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || helperText ? `${inputId}-message` : undefined}
            className={classnames(
              'h-full min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed',
              t.text,
              t.placeholder,
              className
            )}
            {...props}
          />
          {endAdornment && <span className='-mr-1 flex shrink-0 items-center'>{endAdornment}</span>}
        </div>
      </Field>
    )
  }
)

Input.displayName = 'Input'

export default Input
