'use client'

import Button from '@/components/ui/Button'
import Select from '@/components/ui/form/Select'

export type CouponsStatusFilter = '' | 'true' | 'false'

export type CouponsFilterBarProps = {
  isActive: CouponsStatusFilter
  onIsActiveChange: (value: CouponsStatusFilter) => void
  hasFilters: boolean
  onClearFilters: () => void
}

const CouponsFilterBar = ({ isActive, onIsActiveChange, hasFilters, onClearFilters }: CouponsFilterBarProps) => (
  <>
    <Select
      label='Status'
      value={isActive}
      onChange={e => onIsActiveChange(e.target.value as CouponsStatusFilter)}
      containerClassName='min-w-40'
      options={[
        { label: 'All', value: '' },
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' }
      ]}
    />
    {hasFilters && (
      <Button startIcon={<i className='tabler-x' />} size='sm' variant='text' color='secondary' onClick={onClearFilters}>
        Clear filters
      </Button>
    )}
  </>
)

export default CouponsFilterBar
