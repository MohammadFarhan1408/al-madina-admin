'use client'

import { useId, type ReactNode } from 'react'

import classnames from 'classnames'

export type SegmentedOption<T extends string> = { value: T; label?: ReactNode; icon?: string; ariaLabel?: string }

type SegmentedControlProps<T extends string> = {
  value: T
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
  'aria-label': string
  className?: string
}

/** 2–4 mutually exclusive choices, all visible at once (view toggle, status
 *  filter). Native radios underneath, so arrow keys and form semantics are free.
 *  More than ~4 options → use Select. */
const SegmentedControl = <T extends string>({
  value,
  onChange,
  options,
  className,
  ...rest
}: SegmentedControlProps<T>) => {
  const name = useId()

  return (
    <div
      role='radiogroup'
      aria-label={rest['aria-label']}
      className={classnames(
        'inline-flex shrink-0 items-center gap-0.5 rounded-md border border-border bg-surfaceSunken/40 p-0.5',
        className
      )}
    >
      {options.map(o => (
        <label
          key={o.value}
          className={classnames(
            'relative flex min-h-8 cursor-pointer items-center justify-center gap-1.5 rounded px-3 text-sm pointer-coarse:min-h-11',
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
}

export default SegmentedControl
