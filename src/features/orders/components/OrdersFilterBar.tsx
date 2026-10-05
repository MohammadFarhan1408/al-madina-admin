'use client'

import Button from '@/components/ui/Button'
import DateInput from '@/components/ui/form/DateInput'
import SearchField from '@/components/shared/SearchField'
import Select from '@/components/ui/form/Select'
import { humanize } from '@/libs/format'
import { ORDER_STATUSES, PAYMENT_STATUSES, type OrderStatus, type PaymentStatus } from '@/features/orders/types'

export type OrdersFilterBarProps = {
  search: string
  onSearchChange: (value: string) => void
  paymentStatus: PaymentStatus | ''
  onPaymentStatusChange: (value: PaymentStatus | '') => void
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
  search,
  onSearchChange,
  paymentStatus,
  onPaymentStatusChange,
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
    <SearchField
      value={search}
      onChange={onSearchChange}
      placeholder='Search reference, name or email'
      className='min-w-56 flex-1 self-end'
    />
    <Select
      label='Status'
      value={status}
      onChange={e => onStatusChange(e.target.value as OrderStatus | '')}
      containerClassName='min-w-40'
      options={[{ label: 'All statuses', value: '' }, ...ORDER_STATUSES.map(s => ({ label: humanize(s), value: s }))]}
    />
    <Select
      label='Payment'
      value={paymentStatus}
      onChange={e => onPaymentStatusChange(e.target.value as PaymentStatus | '')}
      containerClassName='min-w-40'
      options={[{ label: 'All payments', value: '' }, ...PAYMENT_STATUSES.map(s => ({ label: humanize(s), value: s }))]}
    />
    <DateInput
      clearable
      label='From'
      value={from}
      max={to || undefined}
      onChange={e => onFromChange(e.target.value)}
      containerClassName='min-w-44'
    />
    <DateInput
      clearable
      label='To'
      value={to}
      min={from || undefined}
      onChange={e => onToChange(e.target.value)}
      containerClassName='min-w-44'
    />
    {hasFilters && (
      <Button
        startIcon={<i className='tabler-x' />}
        size='sm'
        variant='text'
        color='secondary'
        onClick={onClearFilters}
      >
        Clear filters
      </Button>
    )}
  </>
)

export default OrdersFilterBar
