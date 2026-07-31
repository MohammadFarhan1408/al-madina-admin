import type { ReactNode } from 'react'

import classnames from 'classnames'

export type FieldTone = 'light' | 'dark' | 'subtle'

export type FieldProps = {
  label?: ReactNode

  /** Set when the field is required so the marker and a11y hint stay in sync. */
  required?: boolean
  error?: string
  helperText?: ReactNode
  tone?: FieldTone

  /** `id` of the control, so clicking the label focuses it. */
  htmlFor?: string

  /** Rendered as a plain <span> instead of a <label> — for composite controls
   *  (comboboxes, upload zones) where no single element owns the label. */
  asLabel?: boolean
  className?: string
  children: ReactNode
}

/** Label + control + message wrapper shared by every form control, so the
 *  vertical rhythm, label weight, required marker and error/helper slot are
 *  identical everywhere instead of being re-declared per component. */
const Field = ({
  label,
  required,
  error,
  helperText,
  tone = 'light',
  htmlFor,
  asLabel = false,
  className,
  children
}: FieldProps) => {
  const dark = tone === 'dark'
  const message = error ?? helperText
  const messageId = htmlFor ? `${htmlFor}-message` : undefined

  const labelClasses = classnames(
    'flex items-center gap-1 text-sm font-medium leading-5',
    dark ? 'text-ivoryDim' : 'text-textPrimary'
  )

  const labelContent = (
    <>
      {label}
      {required && (
        <span aria-hidden className={dark ? 'text-primaryLight' : 'text-error'}>
          *
        </span>
      )}
    </>
  )

  return (
    <div className={classnames('flex min-w-0 flex-col gap-1.5', className)}>
      {label &&
        (asLabel || !htmlFor ? (
          <span className={labelClasses}>{labelContent}</span>
        ) : (
          <label htmlFor={htmlFor} className={labelClasses}>
            {labelContent}
          </label>
        ))}
      {children}
      {message && (
        <span
          id={messageId}
          role={error ? 'alert' : undefined}
          className={classnames(
            'flex items-start gap-1 text-xs leading-4',
            error ? 'text-error' : dark ? 'text-stone' : 'text-textMuted'
          )}
        >
          {error && <i className='tabler-alert-circle mt-px text-[13px]' />}
          {message}
        </span>
      )}
    </div>
  )
}

/** Shared control-surface classes so an Input, a Select and a Combobox are
 *  pixel-identical: same height, radius, border, focus ring and error state. */
export const controlBase =
  'flex items-center gap-2 rounded-md border text-sm transition-[color,background-color,border-color,box-shadow]'

export const controlHeight = 'h-10'

export const controlTone: Record<FieldTone, { idle: string; text: string; placeholder: string }> = {
  light: {
    idle: 'border-borderControl bg-backgroundPaper hover:border-borderStrong',
    text: 'text-textPrimary',
    placeholder: 'placeholder:text-textMuted'
  },
  dark: {
    idle: 'border-primary/30 bg-white/[0.04] hover:border-primary/50',
    text: 'text-ivory caret-primary',
    placeholder: 'placeholder:text-stone'
  },

  // For controls that live in chrome (navbar search, toolbars) rather than in a
  // form: a decorative hairline instead of the gold control border, which at
  // form weight competes with the page's own content for attention. Only for
  // controls that are self-evidently controls — this border is below the 3:1
  // that WCAG 1.4.11 wants from a boundary that is the *only* thing marking a
  // control, so the icon and placeholder have to carry that job.
  subtle: {
    idle: 'border-border bg-backgroundPaper hover:border-borderStrong',
    text: 'text-textPrimary',
    placeholder: 'placeholder:text-textMuted'
  }
}

/** Focus + error treatment applied to the control *wrapper* (focus-within) or
 *  the control itself (focus), depending on whether the control has adornments. */
export const controlState = (error: boolean, within: boolean) => {
  const prefix = within ? 'focus-within' : 'focus'

  return classnames(
    error ? 'border-error' : '',
    `${prefix}:border-primary ${prefix}:ring-2 ${prefix}:ring-primary/35 ${prefix}:outline-none`,
    error && `${prefix}:border-error ${prefix}:ring-error/30`,
    'has-disabled:cursor-not-allowed has-disabled:bg-actionHover has-disabled:opacity-60'
  )
}

export default Field
