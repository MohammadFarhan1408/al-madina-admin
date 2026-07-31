'use client'

import Button from '@/components/ui/Button'
import DateInput from '@/components/ui/form/DateInput'
import Select from '@/components/ui/form/Select'
import { humanize } from '@/libs/format'
import { ORDER_STATUSES, type OrderStatus } from '@/features/orders/types'

export type OrdersFilterBarProps = {
  status: OrderStatus | ''
  onStatusChange: (value: OrderStatus | '') => void
  from: string
  onFromChange: (value: string) => void
  to: string
  onToChange: (value: string) => void
  hasFilters: boolean
  onClearFilters: () => void
}

const OrdersFilterBar = ({
  status,
  onStatusChange,
  from,
  onFromChange,
  to,
  onToChange,
  hasFilters,
  onClearFilters
}: OrdersFilterBarProps) => (
  <>
    <Select
      label='Status'
      value={status}
      onChange={e => onStatusChange(e.target.value as OrderStatus | '')}
      containerClassName='min-w-40'
      options={[{ label: 'All statuses', value: '' }, ...ORDER_STATUSES.map(s => ({ label: humanize(s), value: s }))]}
    />
    <DateInput clearable label='From' value={from} max={to || undefined} onChange={e => onFromChange(e.target.value)} containerClassName='min-w-44' />
    <DateInput clearable label='To' value={to} min={from || undefined} onChange={e => onToChange(e.target.value)} containerClassName='min-w-44' />
    {hasFilters && (
      <Button startIcon={<i className='tabler-x' />} size='sm' variant='text' color='secondary' onClick={onClearFilters}>
        Clear filters
      </Button>
    )}
  </>
)

export default OrdersFilterBar
