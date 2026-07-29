import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'

import classnames from 'classnames'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  helperText?: string
  containerClassName?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, containerClassName, className, id, rows = 4, ...props }, ref) => {
    const textareaId = id ?? props.name

    return (
      <div className={classnames('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={textareaId} className='text-sm font-medium text-textPrimary'>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={classnames(
            'w-full resize-y rounded-md border bg-backgroundPaper px-3 py-2 text-sm text-textPrimary transition-colors',
            'placeholder:text-textDisabled outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50',
            error ? 'border-error' : 'border-secondary/30 focus:border-primary',
            className
          )}
          {...props}
        />
        {(error || helperText) && (
          <span className={classnames('text-xs', error ? 'text-error' : 'text-textSecondary')}>{error ?? helperText}</span>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
