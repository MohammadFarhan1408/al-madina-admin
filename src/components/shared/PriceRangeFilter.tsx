'use client'

// Toolbar pill for a min/max price filter. Its own component rather than a
// Select, because a numeric range needs two fields and an Apply step — no
// single native control covers that.

import { useState } from 'react'

import { autoUpdate, flip, offset, shift, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react'
import classnames from 'classnames'

import Button from '@/components/ui/Button'
import { controlBase, controlState, controlTone } from '@/components/ui/Field'
import Input from '@/components/ui/Input'
import { popoverSurface } from '@/components/ui/Popover'

export type PriceRange = { min?: number; max?: number }

type PriceRangeFilterProps = {
  value: PriceRange
  onChange: (next: PriceRange) => void
  currency?: string
  className?: string
}

const PriceRangeFilter = ({ value, onChange, currency = 'AED', className }: PriceRangeFilterProps) => {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const hasValue = value.min !== undefined || value.max !== undefined
  const t = controlTone.light

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open,
    onOpenChange: next => {
      setOpen(next)
      if (next) setDraft(value)
    },
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })]
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useDismiss(context),
    useRole(context, { role: 'dialog' })
  ])

  const apply = () => {
    onChange(draft)
    setOpen(false)
  }

  const clear = () => {
    onChange({})
    setOpen(false)
  }

  return (
    <>
      <button
        type='button'
        {...getReferenceProps({ ref: refs.setReference })}
        className={classnames(
          controlBase,
          'h-10 justify-start px-3 text-left',
          t.idle,
          controlState(false, false),
          className
        )}
      >
        <i aria-hidden className='tabler-currency-dirham shrink-0 text-textMuted' />
        <span className={classnames('min-w-0 flex-1 truncate text-sm', hasValue ? t.text : t.placeholder)}>
          {hasValue ? `${value.min ?? 0}–${value.max ?? '∞'} ${currency}` : 'Price range'}
        </span>
        <i aria-hidden className='tabler-chevron-down shrink-0 text-[16px] text-textMuted' />
      </button>

      {open && (
        <div
          {...getFloatingProps({
            ref: refs.setFloating,
            style: { ...floatingStyles, opacity: isPositioned ? 1 : 0 },
            className: classnames(popoverSurface, 'w-64 p-3')
          })}
        >
          <div className='flex items-center gap-2'>
            <Input
              type='number'
              inputSize='sm'
              label='Min'
              placeholder='0'
              min={0}
              value={draft.min ?? ''}
              onChange={e => setDraft(d => ({ ...d, min: e.target.value === '' ? undefined : Number(e.target.value) }))}
            />
            <span className='mt-5 text-textMuted'>–</span>
            <Input
              type='number'
              inputSize='sm'
              label='Max'
              placeholder='Any'
              min={0}
              value={draft.max ?? ''}
              onChange={e => setDraft(d => ({ ...d, max: e.target.value === '' ? undefined : Number(e.target.value) }))}
            />
          </div>
          <div className='mt-3 flex items-center justify-end gap-2'>
            <Button size='sm' variant='text' color='secondary' onClick={clear}>
              Clear
            </Button>
            <Button size='sm' onClick={apply}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

export default PriceRangeFilter
