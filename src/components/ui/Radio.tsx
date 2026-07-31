'use client'

import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

import classnames from 'classnames'

import Field from './Field'

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode
  description?: ReactNode
}

/** A single radio. Uses the native input (keyboard arrow-key navigation and
 *  form semantics come free) with the dot drawn by a peer-styled span, so the
 *  mark matches Checkbox and Switch instead of the OS default. */
const Radio = forwardRef<HTMLInputElement, RadioProps>(({ label, description, className, id, ...props }, ref) => {
  const radioId = id ?? (props.name && props.value ? `${props.name}-${props.value}` : undefined)

  return (
    <label
      htmlFor={radioId}
      className={classnames(
        'group flex cursor-pointer items-start gap-2.5 select-none',
        props.disabled && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      <span className='relative flex shrink-0 items-center justify-center pt-px'>
        <input ref={ref} type='radio' id={radioId} className='peer sr-only' {...props} />
        <span
          aria-hidden
          className={classnames(
            'block size-[18px] rounded-full border-2 border-borderControl bg-backgroundPaper transition-[border-color,background-color,box-shadow]',
            'group-hover:border-borderStrong peer-checked:border-primaryDark peer-disabled:group-hover:border-borderControl',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-focus-visible:ring-offset-2'
          )}
        />
        <span
          aria-hidden
          className='pointer-events-none absolute size-2 scale-0 rounded-full bg-primaryDark transition-transform duration-150 ease-out-quart peer-checked:scale-100'
        />
      </span>
      <span className='flex min-w-0 flex-col gap-0.5'>
        <span className='text-sm leading-5 text-textPrimary'>{label}</span>
        {description && <span className='text-xs leading-4 text-textMuted'>{description}</span>}
      </span>
    </label>
  )
})

Radio.displayName = 'Radio'

export type RadioOption = {
  label: ReactNode
  value: string
  description?: ReactNode
  disabled?: boolean
}

export type RadioGroupProps = {
  name: string
  label?: ReactNode
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  error?: string
  helperText?: ReactNode

  /** Lay the options out in a row on wider screens; stacks on mobile either way. */
  inline?: boolean
  className?: string
}

/** Grouped radios wrapped in a fieldset so assistive tech reads the group
 *  label with each option, and in `Field` so the label/error/helper rhythm
 *  matches every other control. */
export const RadioGroup = ({
  name,
  label,
  options,
  value,
  onChange,
  required,
  error,
  helperText,
  inline = false,
  className
}: RadioGroupProps) => (
  <Field label={label} required={required} error={error} helperText={helperText} asLabel className={className}>
    <fieldset
      className={classnames('flex gap-x-6 gap-y-2.5 pt-0.5', inline ? 'flex-col sm:flex-row sm:flex-wrap' : 'flex-col')}
    >
      {label && <legend className='sr-only'>{label}</legend>}
      {options.map(option => (
        <Radio
          key={option.value}
          name={name}
          value={option.value}
          label={option.label}
          description={option.description}
          disabled={option.disabled}
          checked={value === option.value}
          onChange={() => onChange?.(option.value)}
        />
      ))}
    </fieldset>
  </Field>
)

export default Radio
