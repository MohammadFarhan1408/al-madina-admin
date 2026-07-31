'use client'

import { useId, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { autoUpdate, flip, offset, shift, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react'
import classnames from 'classnames'

import Field, { controlBase, controlState, controlTone, type FieldTone } from './Field'
import IconButton from './IconButton'
import { popoverSurface } from './Popover'

export type DatePickerProps = {
  label?: ReactNode
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  minDate?: string
  maxDate?: string
  required?: boolean
  error?: string
  helperText?: ReactNode
  disabled?: boolean
  tone?: FieldTone
  containerClassName?: string
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

// Local-date (not UTC) YYYY-MM-DD, matching what an `<input type="date">`
// produces elsewhere in the system — so a DatePicker value drops into the same
// form state without a timezone-shifted day.
const toISODate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const parseISODate = (value: string | null) => {
  if (!value) return null

  const [year, month, day] = value.split('-').map(Number)

  return new Date(year, month - 1, day)
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

const formatDisplay = (date: Date) =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

/** 6 full weeks (42 days), the surrounding month's dates included so every
 *  row stays 7 columns wide — a 4-or-5-week grid reflows height month to
 *  month, which reads as the calendar glitching rather than just paging. */
const buildGrid = (year: number, month: number) => {
  const firstOfMonth = new Date(year, month, 1)
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay())

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart)

    date.setDate(gridStart.getDate() + i)

    return date
  })
}

/** Fully custom calendar popover — a styled trigger field plus a self-built
 *  month grid — for screens that want the calendar itself in the brand's own
 *  visual language rather than the OS picker `DateInput` opens. Keyboard
 *  support here is Tab/Enter/Escape only, not a roving-tabindex day grid; add
 *  arrow-key day navigation if a screen leans on this as a primary input
 *  rather than an occasional filter. */
const DatePicker = ({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  required,
  error,
  helperText,
  disabled = false,
  tone = 'light',
  containerClassName
}: DatePickerProps) => {
  const [open, setOpen] = useState(false)
  const selected = useMemo(() => parseISODate(value), [value])
  const [viewDate, setViewDate] = useState(() => selected ?? new Date())
  const inputId = useId()
  const t = controlTone[tone]

  const min = parseISODate(minDate ?? null)
  const max = parseISODate(maxDate ?? null)

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open,
    onOpenChange: next => {
      setOpen(next)
      if (next) setViewDate(selected ?? new Date())
    },
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })]
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useDismiss(context),
    useRole(context, { role: 'dialog' })
  ])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const grid = useMemo(() => buildGrid(year, month), [year, month])

  const goToMonth = (nextMonth: number, nextYear: number) => setViewDate(new Date(nextYear, nextMonth, 1))

  const selectDate = (date: Date) => {
    onChange(toISODate(date))
    setOpen(false)
  }

  const isOutOfRange = (date: Date) => Boolean((min && date < min) || (max && date > max))

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
      <button
        type='button'
        id={inputId}
        disabled={disabled}
        {...getReferenceProps({ ref: refs.setReference })}
        className={classnames(
          controlBase,
          'h-10 px-3 text-left',
          t.idle,
          controlState(Boolean(error), false),
          disabled && 'pointer-events-none opacity-60'
        )}
      >
        <span className={classnames('min-w-0 flex-1 truncate', selected ? t.text : t.placeholder)}>
          {selected ? formatDisplay(selected) : placeholder}
        </span>
        <i aria-hidden className='tabler-calendar shrink-0 text-textMuted' />
      </button>

      {open && (
        <div
          {...getFloatingProps({
            ref: refs.setFloating,
            style: { ...floatingStyles, opacity: isPositioned ? 1 : 0 },
            className: classnames(popoverSurface, 'w-72 p-3')
          })}
        >
          <div className='mb-2 flex items-center gap-1.5'>
            <IconButton
              size='sm'
              aria-label='Previous month'
              onClick={() => goToMonth(month === 0 ? 11 : month - 1, month === 0 ? year - 1 : year)}
            >
              <i className='tabler-chevron-left' />
            </IconButton>

            <div className='relative flex-1'>
              <select
                aria-label='Month'
                value={month}
                onChange={e => goToMonth(Number(e.target.value), year)}
                className='h-8 w-full cursor-pointer appearance-none rounded-md bg-actionHover px-2.5 text-sm font-medium text-textPrimary outline-none hover:bg-actionSelected'
              >
                {MONTH_LABELS.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
              <i
                aria-hidden
                className='tabler-chevron-down pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[14px] text-textMuted'
              />
            </div>

            <div className='relative w-24'>
              <select
                aria-label='Year'
                value={year}
                onChange={e => goToMonth(month, Number(e.target.value))}
                className='h-8 w-full cursor-pointer appearance-none rounded-md bg-actionHover px-2.5 text-sm font-medium text-textPrimary outline-none hover:bg-actionSelected'
              >
                {Array.from({ length: 21 }, (_, i) => year - 10 + i).map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <i
                aria-hidden
                className='tabler-chevron-down pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[14px] text-textMuted'
              />
            </div>

            <IconButton
              size='sm'
              aria-label='Next month'
              onClick={() => goToMonth(month === 11 ? 0 : month + 1, month === 11 ? year + 1 : year)}
            >
              <i className='tabler-chevron-right' />
            </IconButton>
          </div>

          <div className='grid grid-cols-7 gap-y-1'>
            {WEEKDAY_LABELS.map(label => (
              <div key={label} className='flex h-8 items-center justify-center text-xs font-semibold text-textPrimary'>
                {label}
              </div>
            ))}
            {grid.map(date => {
              const outOfMonth = date.getMonth() !== month
              const isSelected = Boolean(selected && isSameDay(date, selected))
              const isToday = isSameDay(date, new Date())
              const blocked = isOutOfRange(date)

              return (
                <button
                  key={date.toISOString()}
                  type='button'
                  disabled={blocked}
                  aria-current={isToday ? 'date' : undefined}
                  aria-pressed={isSelected}
                  onClick={() => selectDate(date)}
                  className={classnames(
                    'flex size-8 items-center justify-center justify-self-center rounded-full text-sm transition-colors',
                    'disabled:pointer-events-none disabled:opacity-35',
                    isSelected
                      ? 'bg-primary font-semibold text-richBlack'
                      : classnames(
                          outOfMonth ? 'text-textDisabled' : 'text-textPrimary',
                          'hover:bg-actionHover',
                          isToday && 'font-semibold text-primaryInk'
                        )
                  )}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </Field>
  )
}

export default DatePicker
