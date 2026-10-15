'use client'

// Date-range toolbar filter: one-click presets plus a calendar for a custom
// span. Replaces a pair of From/To date inputs, which took two toolbar slots
// and made the common case ("last 7 days") four clicks.
import { useState } from 'react'

import classnames from 'classnames'

import Button from '@/components/ui/Button'
import Calendar from '@/components/ui/Calendar'
import { popoverSurface } from '@/components/ui/Popover'
import {
  DATE_PRESETS,
  formatDateRange,
  hasDateRange,
  matchPreset,
  type DatePreset,
  type DateRange
} from '@/libs/dateRange'

import { FilterPill, useFilterPopover } from './FilterPill'

type DateRangeFilterProps = {
  label?: string
  value: DateRange
  onChange: (value: DateRange) => void

  /** Preset rows; defaults to the list-page set (today, 7/30 days, months). */
  presets?: DatePreset[]

  /** False where a range is always required (the dashboard): hides Clear. */
  clearable?: boolean
}

const DateRangeFilter = ({
  label = 'Date',
  value,
  onChange,
  presets = DATE_PRESETS,
  clearable = true
}: DateRangeFilterProps) => {
  const [draft, setDraft] = useState<DateRange>(value)
  const popover = useFilterPopover({ onOpen: () => setDraft(value) })
  const activePreset = matchPreset(draft, presets)

  const apply = (next: DateRange) => {
    onChange(next)
    popover.setOpen(false)
  }

  // First click starts a range, the second closes it (in either order); a
  // click after a complete range starts a new one.
  const pick = (day: string) =>
    setDraft(d => {
      if (!d.from || (d.from && d.to)) return { from: day, to: undefined }

      return day < d.from ? { from: day, to: d.from } : { from: d.from, to: day }
    })

  return (
    <>
      <FilterPill
        label={label}
        icon='tabler-calendar'
        valueLabel={hasDateRange(value) ? formatDateRange(value, presets) : undefined}
        open={popover.open}
        {...popover.reference()}
      />

      {popover.open && (
        <div
          {...popover.floating(classnames(popoverSurface, 'flex max-w-[calc(100vw-16px)] flex-col p-0 sm:flex-row'), {
            'aria-label': `${label} range`
          })}
        >
          <ul
            aria-label='Presets'
            className='flex gap-1 overflow-x-auto border-b border-border p-2 sm:w-36 sm:flex-col sm:border-r sm:border-b-0'
          >
            {presets.map(preset => (
              <li key={preset.id} className='shrink-0'>
                <button
                  type='button'
                  aria-pressed={activePreset?.id === preset.id}
                  onClick={() => apply(preset.range())}
                  className={classnames(
                    'w-full rounded-md px-2.5 py-1.5 pointer-coarse:min-h-11 text-left text-sm whitespace-nowrap transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                    activePreset?.id === preset.id
                      ? 'bg-primary/14 font-medium text-primaryInk'
                      : 'text-textPrimary hover:bg-actionHover'
                  )}
                >
                  {preset.label}
                </button>
              </li>
            ))}
          </ul>

          <div className='flex flex-col'>
            <p className='px-3 pt-3 text-xs text-textMuted' aria-live='polite'>
              {draft.from && !draft.to
                ? 'Now pick the end date (or Apply for a single day)'
                : hasDateRange(draft)
                  ? formatDateRange(draft, presets)
                  : 'Pick a start date'}
            </p>
            <Calendar hideFooter range={draft} onSelect={pick} />
            <div
              className={classnames(
                'flex items-center gap-2 border-t border-border px-3 py-2.5',
                clearable ? 'justify-between' : 'justify-end'
              )}
            >
              {clearable && (
                <Button
                  size='sm'
                  variant='text'
                  color='secondary'
                  startIcon={<i className='tabler-x' />}
                  onClick={() => apply({})}
                  disabled={!hasDateRange(value) && !hasDateRange(draft)}
                >
                  Clear
                </Button>
              )}
              <Button
                size='sm'
                startIcon={<i className='tabler-check' />}
                disabled={!draft.from}
                onClick={() => apply({ from: draft.from, to: draft.to ?? draft.from })}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DateRangeFilter
