'use client'

import { useId, type ReactNode } from 'react'

import classnames from 'classnames'

import Field, { controlHeight } from './Field'

export type SegmentedOption<T extends string> = { value: T; label?: ReactNode; icon?: string; ariaLabel?: string }

type SegmentedControlProps<T extends string> = {
  value: T
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
  'aria-label': string

  /** Visible label above the group, so it lines up with labelled Selects in a toolbar. */
  label?: ReactNode

  /** `sm` for dense chrome such as a table footer; `md` matches form controls. */
  size?: 'sm' | 'md'
  className?: string
}

/** 2–5 mutually exclusive choices, all visible at once (view toggle, status
 *  filter). Native radios underneath, so arrow keys and form semantics are free.
 *  More options, or a dynamic list → use Select. Scrolls sideways rather than
 *  overflowing a narrow toolbar. */
const SegmentedControl = <T extends string>({
  value,
  onChange,
  options,
  label,
  size = 'md',
  className,
  ...rest
}: SegmentedControlProps<T>) => {
  const name = useId()

  const group = (
    <div
      role='radiogroup'
      aria-label={rest['aria-label']}
      className={classnames(
        'inline-flex max-w-full shrink-0 items-stretch gap-0.5 overflow-x-auto rounded-md border border-border bg-surfaceSunken/40 p-0.5',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        size === 'sm' ? 'h-8 pointer-coarse:h-11' : controlHeight,
        !label && className
      )}
    >
      {options.map(o => (
        <label
          key={o.value}
          className={classnames(
            'relative flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded whitespace-nowrap',
            size === 'sm' ? 'px-2.5 text-xs' : 'px-3 text-sm',
            'transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/60',
            value === o.value ? 'bg-primary text-richBlack shadow-xs' : 'text-textSecondary hover:bg-actionHover'
          )}
        >
          <input
            type='radio'
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            aria-label={o.ariaLabel}
            className='sr-only'
          />
          {o.icon && <i className={classnames(o.icon, 'text-base')} />}
          {o.label}
        </label>
      ))}
    </div>
  )

  return label ? (
    <Field asLabel label={label} className={classnames('max-w-full', className)}>
      {group}
    </Field>
  ) : (
    group
  )
}

export default SegmentedControl
