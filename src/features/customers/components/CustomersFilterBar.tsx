'use client'

import SearchField from '@/components/shared/SearchField'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/form/Select'
import { USER_TIERS, type UserTier } from '@/features/customers/types'

export type CustomersFilterBarProps = {
  search: string
  onSearchChange: (value: string) => void
  tier: UserTier | ''
  onTierChange: (value: UserTier | '') => void
  hasFilters: boolean
  onClearFilters: () => void
}

const CustomersFilterBar = ({
  search,
  onSearchChange,
  tier,
  onTierChange,
  hasFilters,
  onClearFilters
}: CustomersFilterBarProps) => (
  <>
    <SearchField
      value={search}
      onChange={onSearchChange}
      placeholder='Search name or email'
      className='min-w-56 flex-1'
    />
    <Select
      label='Tier'
      value={tier}
      onChange={e => onTierChange(e.target.value as UserTier | '')}
      containerClassName='min-w-44'
      options={[{ label: 'All tiers', value: '' }, ...USER_TIERS.map(t => ({ label: t, value: t }))]}
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

export default CustomersFilterBar
