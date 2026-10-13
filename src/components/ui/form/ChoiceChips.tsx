'use client'

import { useId, type ReactNode } from 'react'

import classnames from 'classnames'

import Field from './Field'

export type ChoiceChip<T extends string | number> = {
  value: T
  label: ReactNode

  /** Tabler class shown before the label. */
  icon?: string

  /** A colour class (e.g. `bg-accentGold`) for a swatch dot before the label. */
  swatch?: string

  /** Screen-reader name when the visible label isn't enough on its own. */
  ariaLabel?: string
}

type ChoiceChipsProps<T extends string | number> = {
  label?: ReactNode
  value: T | undefined
  onChange: (value: T) => void
  options: ChoiceChip<T>[]
  required?: boolean
  error?: string
  helperText?: ReactNode
  className?: string
}

/** One choice from a short, fixed list (3–8 values), every option visible as
 *  a chip that wraps onto more lines as needed — for form fields where a
 *  dropdown would hide the options behind a click (scent family, bottle size,
 *  badge, accent). Native radios underneath: arrow keys move the choice, and
 *  the group is announced with its label. Above ~8 options, or for a list that
 *  grows with data, use Select. */
const ChoiceChips = <T extends string | number>({
  label,
  value,
  onChange,
  options,
  required,
  error,
  helperText,
  className
}: ChoiceChipsProps<T>) => {
  const name = useId()

  return (
    <Field label={label} required={required} error={error} helperText={helperText} asLabel className={className}>
      <div
        role='radiogroup'
        aria-label={typeof label === 'string' ? label : undefined}
        className='flex flex-wrap gap-2'
      >
        {options.map(option => {
          const checked = option.value === value

          return (
            <label
              key={String(option.value)}
              className={classnames(
                'relative inline-flex h-9 pointer-coarse:h-11 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm whitespace-nowrap select-none',
                'transition-[color,background-color,border-color,box-shadow]',
                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/45',
                checked
                  ? 'border-primary bg-primary/16 font-medium text-primaryInk'
                  : error
                    ? 'border-error/60 bg-backgroundPaper text-textSecondary hover:border-error'
                    : 'border-borderControl/45 bg-backgroundPaper text-textSecondary hover:border-borderStrong hover:text-textPrimary'
              )}
            >
              <input
                type='radio'
                name={name}
                checked={checked}
                onChange={() => onChange(option.value)}
                aria-label={option.ariaLabel}
                className='sr-only'
              />
              {checked ? (
                <i aria-hidden className='tabler-check text-[15px]' />
              ) : option.icon ? (
                <i aria-hidden className={classnames(option.icon, 'text-[15px]')} />
              ) : null}
              {option.swatch && (
                <span
                  aria-hidden
                  className={classnames('size-3 shrink-0 rounded-full ring-1 ring-richBlack/15', option.swatch)}
                />
              )}
              {option.label}
            </label>
          )
        })}
      </div>
    </Field>
  )
}

export default ChoiceChips
