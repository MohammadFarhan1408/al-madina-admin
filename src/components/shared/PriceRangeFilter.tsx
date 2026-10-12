'use client'

// Toolbar pill for a min/max price filter. Its own component rather than a
// Select, because a numeric range needs two fields and an Apply step — no
// single native control covers that.

import { useState } from 'react'

import classnames from 'classnames'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/form/Input'
import { popoverSurface } from '@/components/ui/Popover'
import { formatCurrency } from '@/libs/format'

import { FilterPill, useFilterPopover } from './FilterPill'

export type PriceRange = { min?: number; max?: number }

type PriceRangeFilterProps = {
  value: PriceRange
  onChange: (next: PriceRange) => void
  currency?: string
  className?: string
}

const formatRange = ({ min, max }: PriceRange, currency: string) => {
  const fmt = (n: number) => formatCurrency(n, currency).replace(/\.00$/, '')

  if (min !== undefined && max !== undefined) return `${fmt(min)} – ${fmt(max)}`
  if (min !== undefined) return `${fmt(min)}+`
  if (max !== undefined) return `Up to ${fmt(max)}`

  return undefined
}

const PriceRangeFilter = ({ value, onChange, currency = 'AED', className }: PriceRangeFilterProps) => {
  const [draft, setDraft] = useState(value)
  const popover = useFilterPopover({ onOpen: () => setDraft(value) })

  // A reversed range matches nothing server-side — block it here with a
  // reason rather than returning an empty table.
  const invalid = draft.min !== undefined && draft.max !== undefined && draft.min > draft.max

  const apply = () => {
    if (invalid) return
    onChange(draft)
    popover.setOpen(false)
  }

  const clear = () => {
    onChange({})
    popover.setOpen(false)
  }

  return (
    <>
      <FilterPill
        label='Price'
        icon='tabler-currency-dirham'
        valueLabel={formatRange(value, currency)}
        open={popover.open}
        className={className}
        {...popover.reference()}
      />

      {popover.open && (
        <form
          {...popover.floating(classnames(popoverSurface, 'w-64 p-3'), { 'aria-label': 'Price range' })}
          onSubmit={e => {
            e.preventDefault()
            apply()
          }}
        >
          <div className='flex items-center gap-2'>
            <Input
              type='number'
              inputSize='sm'
              label={`Min (${currency})`}
              placeholder='0'
              min={0}
              autoFocus
              value={draft.min ?? ''}
              onChange={e => setDraft(d => ({ ...d, min: e.target.value === '' ? undefined : Number(e.target.value) }))}
            />
            <span aria-hidden className='mt-5 text-textMuted'>
              –
            </span>
            <Input
              type='number'
              inputSize='sm'
              label={`Max (${currency})`}
              placeholder='Any'
              min={0}
              value={draft.max ?? ''}
              onChange={e => setDraft(d => ({ ...d, max: e.target.value === '' ? undefined : Number(e.target.value) }))}
            />
          </div>
          {invalid && (
            <p role='alert' className='mt-2 text-xs text-errorDark'>
              Min must be less than or equal to max.
            </p>
          )}
          <div className='mt-3 flex items-center justify-end gap-2'>
            <Button size='sm' variant='text' color='secondary' onClick={clear}>
              Clear
            </Button>
            <Button size='sm' type='submit' disabled={invalid}>
              Apply
            </Button>
          </div>
        </form>
      )}
    </>
  )
}

export default PriceRangeFilter
