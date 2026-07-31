import { forwardRef, useId } from 'react'
import type { ReactNode, TextareaHTMLAttributes } from 'react'

import classnames from 'classnames'

import Field, { controlBase, controlState, controlTone, type FieldTone } from './Field'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode
  error?: string
  helperText?: ReactNode
  tone?: FieldTone
  containerClassName?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, helperText, containerClassName, className, id, rows = 4, tone = 'light', required, ...props },
    ref
  ) => {
    const reactId = useId()
    const textareaId = id ?? props.name ?? reactId
    const t = controlTone[tone]

    return (
      <Field
        label={label}
        required={required}
        error={error}
        helperText={helperText}
        tone={tone}
        htmlFor={textareaId}
        className={containerClassName}
      >
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helperText ? `${textareaId}-message` : undefined}
          className={classnames(
            controlBase,
            'block resize-y px-3 py-2.5 leading-relaxed',
            t.idle,
            t.text,
            t.placeholder,
            controlState(Boolean(error), false),
            'disabled:cursor-not-allowed disabled:opacity-60',
            className
          )}
          {...props}
        />
      </Field>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
