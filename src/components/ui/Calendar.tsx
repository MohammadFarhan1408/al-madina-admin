'use client'

import { useState } from 'react'

import classnames from 'classnames'

import IconButton from './IconButton'

export type CalendarProps = {

  /** `YYYY-MM-DD`, matching the native date input's value format. */
  value?: string
  onSelect: (value: string) => void
  onClear?: () => void
  min?: string
  max?: string

  /** Highlight a span of days (`YYYY-MM-DD` keys) — for range pickers, which
   *  drive selection themselves through `onSelect`. */
  range?: { from?: string; to?: string }

  /** Hide the Clear / Today footer (a range picker supplies its own actions). */
  hideFooter?: boolean
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const parseKey = (key?: string) => {
  if (!key) return null
  const [y, m, d] = key.split('-').map(Number)

  return y && m && d ? new Date(y, m - 1, d) : null
}

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

/** Month-grid date picker used inside DateInput's popover — replaces the
 *  browser's native calendar, which renders with mismatched fonts/spacing on
 *  every platform and can't be themed at all. */
const Calendar = ({ value, onSelect, onClear, min, max, range, hideFooter = false }: CalendarProps) => {
  const selected = parseKey(value)
  const rangeFrom = parseKey(range?.from)
  const rangeTo = parseKey(range?.to)
  const isEndpoint = (d: Date) => Boolean((rangeFrom && isSameDay(d, rangeFrom)) || (rangeTo && isSameDay(d, rangeTo)))
  const isInside = (d: Date) => Boolean(rangeFrom && rangeTo && d > rangeFrom && d < rangeTo)
  const today = new Date()
  const [cursor, setCursor] = useState(selected ?? rangeFrom ?? today)

  const minDate = parseKey(min)
  const maxDate = parseKey(max)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const startWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (Date | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
  ]

  const isDisabled = (d: Date) => Boolean((minDate && d < minDate) || (maxDate && d > maxDate))

  return (
    <div className='w-64 p-3'>
      <div className='mb-2 flex items-center justify-between'>
        <span className='text-sm font-semibold text-textPrimary'>
          {cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </span>
        <div className='flex items-center gap-0.5'>
          <IconButton size='sm' aria-label='Previous month' onClick={() => setCursor(new Date(year, month - 1, 1))}>
            <i className='tabler-chevron-left' />
          </IconButton>
          <IconButton size='sm' aria-label='Next month' onClick={() => setCursor(new Date(year, month + 1, 1))}>
            <i className='tabler-chevron-right' />
          </IconButton>
        </div>
      </div>

      <div className='grid grid-cols-7 place-items-center text-xs font-medium text-textMuted'>
        {WEEKDAYS.map((w, i) => (
          <span key={i} className='py-1'>
            {w}
          </span>
        ))}
      </div>

      <div className='grid grid-cols-7 place-items-center gap-y-0.5'>
        {cells.map((d, i) =>
          d ? (
            <button
              key={i}
              type='button'
              disabled={isDisabled(d)}
              onClick={() => onSelect(toKey(d))}
              aria-pressed={range ? isEndpoint(d) : undefined}
              aria-label={d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
              className={classnames(
                'flex size-8 items-center justify-center rounded-full text-sm transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-35',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                (selected && isSameDay(d, selected)) || isEndpoint(d)
                  ? 'bg-primary font-semibold text-richBlack'
                  : isInside(d)
                    ? 'rounded-md bg-primary/16 text-primaryInk'
                    : isSameDay(d, today)
                      ? 'border border-primary text-primaryInk'
                      : 'text-textPrimary hover:bg-actionHover'
              )}
            >
              {d.getDate()}
            </button>
          ) : (
            <span key={i} />
          )
        )}
      </div>

      {!hideFooter && (
        <div className='mt-2 flex items-center justify-between border-t border-border pt-2'>
          {onClear ? (
            <button
              type='button'
              onClick={onClear}
              className='rounded-sm text-xs font-medium text-primaryInk hover:underline'
            >
              Clear
            </button>
          ) : (
            <span />
          )}
          <button
            type='button'
            onClick={() => {
              setCursor(today)
              onSelect(toKey(today))
            }}
            className='rounded-sm text-xs font-medium text-primaryInk hover:underline'
          >
            Today
          </button>
        </div>
      )}
    </div>
  )
}

export default Calendar
