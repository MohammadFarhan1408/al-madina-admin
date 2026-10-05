'use client'

// The Products list toolbar: search + view toggle on their own row, the
// category/family/stock/price filters wrapping on a second row underneath —
// keeps a 5-filter set from crowding into one overflowing line.

import SegmentedControl from '@/components/ui/form/SegmentedControl'
import Button from '@/components/ui/Button'
import SearchField from '@/components/shared/SearchField'
import PriceRangeFilter, { type PriceRange } from '@/components/shared/PriceRangeFilter'
import Select from '@/components/ui/form/Select'
import { humanize } from '@/libs/format'
import type { Category } from '@/features/categories/types'
import { SCENT_FAMILIES, type ScentFamily } from '@/features/products/types'

export type ProductsView = 'table' | 'grid'
export type StockFilter = '' | 'true' | 'false'

const STOCK_OPTIONS: { label: string; value: StockFilter }[] = [
  { label: 'In stock', value: 'true' },
  { label: 'Out of stock', value: 'false' }
]

const FAMILY_OPTIONS = SCENT_FAMILIES.map(family => ({ label: humanize(family), value: family }))

// Two-up on phones, fixed width from `sm` — the row wraps instead of overflowing.
const filterSelectClassName = 'min-w-36 flex-1 sm:w-44 sm:flex-none'

export type ProductsFilterBarProps = {
  search: string
  onSearchChange: (value: string) => void

  categoryId: string
  onCategoryIdChange: (value: string) => void
  categories: Category[]

  family: ScentFamily | ''
  onFamilyChange: (value: ScentFamily | '') => void

  stock: StockFilter
  onStockChange: (value: StockFilter) => void

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
  stock,
  onStockChange,
  priceRange,
  onPriceRangeChange,
  view,
  onViewChange,
  hasFilters,
  onClearFilters
}: ProductsFilterBarProps) => (
  <div className='flex w-full flex-col gap-3'>
    <div className='flex flex-wrap items-center gap-2'>
      <SearchField
        value={search}
        onChange={onSearchChange}
        placeholder='Search product name…'
        tone='subtle'
        className='min-w-full flex-1 sm:min-w-56'
      />

      <Select
        value={categoryId}
        onChange={e => onCategoryIdChange(e.target.value)}
        icon={<i className='tabler-tag' />}
        placeholder='Category'
        containerClassName={filterSelectClassName}
        options={categories.map(category => ({ label: category.name, value: category.id }))}
      />
      <Select
        value={family}
        onChange={e => onFamilyChange(e.target.value as ScentFamily | '')}
        icon={<i className='tabler-droplet' />}
        placeholder='Scent family'
        containerClassName={filterSelectClassName}
        options={FAMILY_OPTIONS}
      />
      <Select
        value={stock}
        onChange={e => onStockChange(e.target.value as StockFilter)}
        icon={<i className='tabler-adjustments-alt' />}
        placeholder='Stock'
        containerClassName={filterSelectClassName}
        options={STOCK_OPTIONS}
      />
      <PriceRangeFilter value={priceRange} onChange={onPriceRangeChange} className={filterSelectClassName} />
      <SegmentedControl
        aria-label='Layout'
        value={view}
        onChange={onViewChange}
        options={[
          { value: 'table', icon: 'tabler-list', ariaLabel: 'List view' },
          { value: 'grid', icon: 'tabler-layout-grid', ariaLabel: 'Grid view' }
        ]}
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
    </div>
  </div>
)

export default ProductsFilterBar
