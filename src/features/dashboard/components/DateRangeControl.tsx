'use client'

import DateInput from '@/components/ui/form/DateInput'
import SegmentedControl from '@/components/ui/form/SegmentedControl'
import { RANGE_PRESETS, type DashboardRange, type RangePreset } from '@/features/dashboard/range'

type DateRangeControlProps = {
  range: DashboardRange
  onChange: (range: DashboardRange) => void

  /** Why the custom range can't be queried, if it can't. */
  error?: string
}

const OPTIONS = [
  ...RANGE_PRESETS.map(p => ({ value: p.value, label: p.label })),
  { value: 'custom', label: 'Custom' }
] as {
  value: RangePreset
  label: string
}[]

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Preset windows plus a custom from/to. Switching to Custom starts from the
 *  last 30 days so the fields are never empty. */
const DateRangeControl = ({ range, onChange, error }: DateRangeControlProps) => (
  <div className='flex flex-col gap-2 sm:items-end'>
    <SegmentedControl
      aria-label='Date range'
      value={range.preset}
      options={OPTIONS}
      onChange={preset => {
        if (preset !== 'custom') return onChange({ ...range, preset })

        const to = new Date()
        const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)

        onChange({ preset, from: range.from || isoDay(from), to: range.to || isoDay(to) })
      }}
    />
    {range.preset === 'custom' && (
      <div className='flex flex-wrap items-start gap-2'>
        <DateInput
          aria-label='From date'
          value={range.from}
          onChange={e => onChange({ ...range, from: e.target.value })}
          containerClassName='w-40'
        />
        <DateInput
          aria-label='To date'
          value={range.to}
          onChange={e => onChange({ ...range, to: e.target.value })}
          containerClassName='w-40'
          error={error}
        />
      </div>
    )}
  </div>
)

export default DateRangeControl
