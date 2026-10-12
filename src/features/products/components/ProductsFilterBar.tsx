'use client'

// Products toolbar: search, then the secondary filters as popover pills
// (category, scent family, price) and the table/grid toggle. Stock — the
// primary split — lives in the tabs above, with counts.
import Button from '@/components/ui/Button'
import SegmentedControl from '@/components/ui/form/SegmentedControl'
import FilterSelect from '@/components/shared/FilterSelect'
import PriceRangeFilter, { type PriceRange } from '@/components/shared/PriceRangeFilter'
import SearchField from '@/components/shared/SearchField'
import { humanize } from '@/libs/format'
import type { Category } from '@/features/categories/types'
import { SCENT_FAMILIES, type ScentFamily } from '@/features/products/types'

export type ProductsView = 'table' | 'grid'
export type StockFilter = '' | 'true' | 'false'

const FAMILY_OPTIONS = SCENT_FAMILIES.map(family => ({ label: humanize(family), value: family }))

export type ProductsFilterBarProps = {
  search: string
  onSearchChange: (value: string) => void

  categoryId: string
  onCategoryIdChange: (value: string) => void
  categories: Category[]

  family: ScentFamily | ''
  onFamilyChange: (value: ScentFamily | '') => void

  priceRange: PriceRange
  onPriceRangeChange: (value: PriceRange) => void

  view: ProductsView
  onViewChange: (view: ProductsView) => void

  hasFilters: boolean
  onClearFilters: () => void
}

const ProductsFilterBar = ({
  search,
  onSearchChange,
  categoryId,
  onCategoryIdChange,
  categories,
  family,
  onFamilyChange,
  priceRange,
  onPriceRangeChange,
  view,
  onViewChange,
  hasFilters,
  onClearFilters
}: ProductsFilterBarProps) => (
  <>
    <SearchField
      value={search}
      onChange={onSearchChange}
      placeholder='Search name, brand or notes…'
      tone='subtle'
      className='min-w-full flex-1 sm:min-w-56'
    />
    <FilterSelect
      label='Category'
      icon='tabler-category'
      allLabel='All categories'
      value={categoryId}
      onChange={onCategoryIdChange}
      options={categories.map(category => ({ label: category.name, value: category.id }))}
    />
    <FilterSelect<ScentFamily>
      label='Scent family'
      icon='tabler-droplet'
      allLabel='All families'
      value={family}
      onChange={onFamilyChange}
      options={FAMILY_OPTIONS}
    />
    <PriceRangeFilter value={priceRange} onChange={onPriceRangeChange} />
    {hasFilters && (
      <Button startIcon={<i className='tabler-x' />} variant='text' color='secondary' onClick={onClearFilters}>
        Clear filters
      </Button>
    )}
    <SegmentedControl
      aria-label='Layout'
      className='ml-auto'
      value={view}
      onChange={onViewChange}
      options={[
        { value: 'table', icon: 'tabler-list', ariaLabel: 'List view' },
        { value: 'grid', icon: 'tabler-layout-grid', ariaLabel: 'Grid view' }
      ]}
    />
  </>
)

export default ProductsFilterBar
