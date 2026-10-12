'use client'

// Customers toolbar: just search. Loyalty tier — the only other filter the
// API offers — is the tab row above the table, with counts.
import SearchField from '@/components/shared/SearchField'
import Button from '@/components/ui/Button'

export type CustomersFilterBarProps = {
  search: string
  onSearchChange: (value: string) => void
  hasFilters: boolean
  onClearFilters: () => void
}

const CustomersFilterBar = ({ search, onSearchChange, hasFilters, onClearFilters }: CustomersFilterBarProps) => (
  <>
    <SearchField
      value={search}
      onChange={onSearchChange}
      placeholder='Search name or email…'
      tone='subtle'
      className='min-w-full flex-1 sm:min-w-56'
    />
    {hasFilters && (
      <Button startIcon={<i className='tabler-x' />} variant='text' color='secondary' onClick={onClearFilters}>
        Clear filters
      </Button>
    )}
  </>
)

export default CustomersFilterBar
