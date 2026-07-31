import { forwardRef, useId } from 'react'
import type { ReactNode, SelectHTMLAttributes } from 'react'

import classnames from 'classnames'

import Field, { controlBase, controlState, controlTone, type FieldTone } from './Field'
import type { InputSize } from './Input'

export type SelectOption = {
  label: string
  value: string | number
  disabled?: boolean
}

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  label?: ReactNode
  error?: string
  helperText?: ReactNode
  options: SelectOption[]
  placeholder?: string
  inputSize?: InputSize
  tone?: FieldTone
  containerClassName?: string

  /** Leading icon — for a filter pill (Category, Stock) where the icon carries
   *  the field's identity instead of a label sitting above it. */
  icon?: ReactNode
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'h-9 pl-2.5 pr-8',
  md: 'h-10 pl-3 pr-9',
  lg: 'h-11 pl-3.5 pr-10'
}

const iconSizeClasses: Record<InputSize, string> = {
  sm: 'h-9 pl-8 pr-8',
  md: 'h-10 pl-9 pr-9',
  lg: 'h-11 pl-10 pr-10'
}

const leadingIconPosition: Record<InputSize, string> = {
  sm: 'left-2.5',
  md: 'left-3',
  lg: 'left-3.5'
}

/** Native `<select>` with the platform arrow suppressed and ours drawn on top,
 *  so it matches Input's height, radius, border and focus ring while keeping
 *  the OS picker — which is still the best option list on touch devices. */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      containerClassName,
      className,
      id,
      inputSize = 'md',
      tone = 'light',
      required,
      icon,
      ...props
    },
    ref
  ) => {
    const reactId = useId()
    const selectId = id ?? props.name ?? reactId
    const t = controlTone[tone]

    return (
      <Field
        label={label}
        required={required}
        error={error}
        helperText={helperText}
        tone={tone}
        htmlFor={selectId}
        className={containerClassName}
      >
        <div className='relative flex'>
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || helperText ? `${selectId}-message` : undefined}
            className={classnames(
              controlBase,
              icon ? iconSizeClasses[inputSize] : sizeClasses[inputSize],
              t.idle,
              t.text,
              controlState(Boolean(error), false),
              'cursor-pointer appearance-none truncate disabled:cursor-not-allowed disabled:opacity-60',
              tone === 'dark' && '[&>option]:bg-charcoal [&>option]:text-ivory',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value='' disabled={required}>
                {placeholder}
              </option>
            )}
            {options.map(option => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          {icon && (
            <span
              aria-hidden
              className={classnames(
                'pointer-events-none absolute top-[55%] -translate-y-1/2 text-[16px]',
                leadingIconPosition[inputSize],
                tone === 'dark' ? 'text-stone' : 'text-textMuted'
              )}
            >
              {icon}
            </span>
          )}
          <i
            aria-hidden
            className={classnames(
              'tabler-chevron-down pointer-events-none absolute top-1/2 -translate-y-1/2 text-[16px]',
              inputSize === 'sm' ? 'right-2' : 'right-3',
              tone === 'dark' ? 'text-stone' : 'text-textMuted'
            )}
          />
        </div>
      </Field>
    )
  }
)

Select.displayName = 'Select'

export default Select
