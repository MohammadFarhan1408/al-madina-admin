'use client'

// Orders toolbar: search, payment status and a date range. Order status — the
// primary split — is the tab row above, with counts.
import Button from '@/components/ui/Button'
import DateRangeFilter from '@/components/shared/DateRangeFilter'
import FilterSelect from '@/components/shared/FilterSelect'
import SearchField from '@/components/shared/SearchField'
import { humanize } from '@/libs/format'
import type { DateRange } from '@/libs/dateRange'
import { PAYMENT_STATUSES, type PaymentStatus } from '@/features/orders/types'

export type OrdersFilterBarProps = {
  search: string
  onSearchChange: (value: string) => void
  paymentStatus: PaymentStatus | ''
  onPaymentStatusChange: (value: PaymentStatus | '') => void
  dateRange: DateRange
  onDateRangeChange: (value: DateRange) => void
  hasFilters: boolean
  onClearFilters: () => void
}

const PAYMENT_OPTIONS = PAYMENT_STATUSES.map(s => ({ label: humanize(s), value: s }))

const OrdersFilterBar = ({
  search,
  onSearchChange,
  paymentStatus,
  onPaymentStatusChange,
  dateRange,
  onDateRangeChange,
  hasFilters,
  onClearFilters
}: OrdersFilterBarProps) => (
  <>
    <SearchField
      value={search}
      onChange={onSearchChange}
      placeholder='Search reference, name or email…'
      tone='subtle'
      className='min-w-full flex-1 sm:min-w-56'
    />
    <FilterSelect<PaymentStatus>
      label='Payment'
      icon='tabler-credit-card'
      allLabel='All payment statuses'
      value={paymentStatus}
      onChange={onPaymentStatusChange}
      options={PAYMENT_OPTIONS}
    />
    <DateRangeFilter label='Placed' value={dateRange} onChange={onDateRangeChange} />
    {hasFilters && (
      <Button startIcon={<i className='tabler-x' />} variant='text' color='secondary' onClick={onClearFilters}>
        Clear filters
      </Button>
    )}
  </>
)

export default OrdersFilterBar
