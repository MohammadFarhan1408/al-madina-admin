'use client'

// Products management — server-paginated table (or card grid) with
// search/category/family/stock/price filters, row selection with bulk
// delete, navigates to dedicated Create/Detail/Edit pages.
import { useEffect, useMemo, useState } from 'react'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'

import MobileRow from '@/components/shared/MobileRow'
import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import ExportButton, { type ExportColumn } from '@/components/shared/ExportButton'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import EntityCell from '@/components/shared/EntityCell'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import RowActions from '@/components/shared/RowActions'
import type { PriceRange } from '@/components/shared/PriceRangeFilter'
import Alert from '@/components/ui/Alert'
import IconButton from '@/components/ui/IconButton'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Rating from '@/components/ui/Rating'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useFilterReset } from '@/hooks/useFilterReset'
import { useToast } from '@/contexts/ToastContext'
import { formatCurrency } from '@/libs/format'
import { useCategories } from '@/features/categories/hooks/useCategories'
import ProductsFilterBar, {
  type ProductsView as ProductsListView,
  type StockFilter
} from '@/features/products/components/ProductsFilterBar'
import { productsApi } from '@/features/products/api/productsApi'
import { useDeleteProduct, useProducts } from '@/features/products/hooks/useProducts'
import type { Product, ScentFamily, ProductListParams } from '@/features/products/types'

const ProductsView = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '')
  const [categoryId, setCategoryId] = useState(() => searchParams.get('categoryId') ?? '')
  const [family, setFamily] = useState<ScentFamily | ''>(() => (searchParams.get('family') as ScentFamily) ?? '')
  const [stock, setStock] = useState<StockFilter>(() => (searchParams.get('stock') as StockFilter) ?? '')
  const [priceRange, setPriceRange] = useState<PriceRange>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [view, setView] = useState<ProductsListView>('table')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const debouncedSearch = useDebouncedValue(search)
  const resetOnChange = useFilterReset(setPagination)

  const [bulkConfirm, setBulkConfirm] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const { data: categories } = useCategories()
  const deleteMutation = useDeleteProduct()
  const { success, error: toastError } = useToast()

  // Keep filters in the URL, matching the existing `q` sync.
  useEffect(() => {
    const params = new URLSearchParams()

    if (debouncedSearch) params.set('q', debouncedSearch)
    if (categoryId) params.set('categoryId', categoryId)
    if (family) params.set('family', family)
    if (stock) params.set('stock', stock)
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, categoryId, family, stock])

  const categoryMap = useMemo(() => new Map((categories ?? []).map(c => [c.id, c.name])), [categories])

  const sort = sorting[0]?.id === 'price' ? (sorting[0].desc ? 'price_desc' : 'price_asc') : 'featured'

  const filters: ProductListParams = {
    q: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    family: family || undefined,
    inStock: stock === '' ? undefined : stock === 'true',
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
    sort
  }

  const { data, isLoading, isFetching, isError, error } = useProducts({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...filters
  })

  const items = data?.items ?? []
  const hasFilters = Boolean(search || categoryId || family || stock || priceRange.min || priceRange.max)

  const clearFilters = () => {
    setSearch('')
    setCategoryId('')
    setFamily('')
    setStock('')
    setPriceRange({})
    setPagination(p => ({ ...p, pageIndex: 0 }))
  }

  const { ask: askDelete, dialog: deleteDialog } = useConfirmDelete<Product>({
    entity: 'product',
    remove: p => deleteMutation.mutateAsync(p.id),
    name: p => p.name
  })

  const deleteSelected = async () => {
    setBulkDeleting(true)

    // allSettled so one failure doesn't hide which of the others went through.
    const results = await Promise.allSettled([...selectedIds].map(id => deleteMutation.mutateAsync(id)))
    const failed = results.filter(r => r.status === 'rejected')

    if (failed.length) {
      toastError(`${failed.length} of ${results.length} products could not be deleted`)
    } else {
      success(`${results.length} product${results.length === 1 ? '' : 's'} deleted`)
    }

    setSelectedIds(new Set())
    setBulkConfirm(false)
    setBulkDeleting(false)
  }

  const exportColumns: ExportColumn<Product>[] = [
    { header: 'Name', value: p => p.name },
    { header: 'Brand', value: p => p.brand },
    { header: 'Category', value: p => categoryMap.get(p.categoryId) },
    { header: 'Scent family', value: p => p.scentFamily },
    { header: 'Price', value: p => p.price },
    { header: 'Currency', value: p => p.currency },
    { header: 'In stock', value: p => (p.inStock ? 'yes' : 'no') },
    { header: 'Badge', value: p => p.badge },
    { header: 'SKU', value: p => p.variants?.[0]?.sku },
    { header: 'Rating', value: p => p.rating },
    { header: 'Reviews', value: p => p.reviewCount }
  ]

  const columns = useMemo<ColumnDef<Product, any>[]>(
    () => [
      {
        header: 'Product',
        accessorKey: 'name',
        enableSorting: false,
        cell: ({ row }) => (
          <EntityCell
            name={row.original.name}
            subtitle={`by ${row.original.brand}`}
            image={row.original.images?.[0]}
            onClick={() => router.push(`/products/${row.original.id}`)}
          />
        )
      },
      {
        header: 'SKU',
        enableSorting: false,
        cell: ({ row }) => (
          <span className='font-mono text-xs text-textSecondary'>{row.original.variants?.[0]?.sku ?? '—'}</span>
        )
      },
      {
        header: 'Category',
        accessorKey: 'categoryId',
        enableSorting: false,
        cell: ({ getValue }) => categoryMap.get(getValue() as string) ?? '—'
      },
      {
        header: 'Stock',
        accessorKey: 'inStock',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ getValue }) => <StatusChip value={(getValue() as boolean) ? 'in-stock' : 'out-of-stock'} />
      },
      {
        header: 'Price',
        accessorKey: 'price',
        meta: { align: 'right' },
        cell: ({ row }) => formatCurrency(row.original.price, row.original.currency)
      },
      {
        header: 'Reviews',
        accessorKey: 'reviewCount',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ getValue }) => <span className='tabular-nums'>{getValue() as number}</span>
      },
      {
        header: 'Rating',
        accessorKey: 'rating',
        enableSorting: false,
        cell: ({ getValue }) => <Rating value={getValue() as number} size='sm' />
      },
      {
        header: 'Status',
        accessorKey: 'badge',
        enableSorting: false,
        cell: ({ getValue }) => <StatusChip value={getValue() as string} />
      },
      {
        header: 'Actions',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className='flex items-center justify-end'>
            <IconButton
              size='sm'
              aria-label={`View ${row.original.name}`}
              onClick={() => router.push(`/products/${row.original.id}`)}
            >
              <i className='tabler-eye' />
            </IconButton>
            <RowActions
              label={row.original.name}
              options={[
                {
                  text: 'Edit',
                  icon: 'tabler-edit',
                  onClick: () => router.push(`/products/${row.original.id}/edit`)
                },
                { text: 'Delete', icon: 'tabler-trash', danger: true, onClick: () => askDelete(row.original) }
              ]}
            />
          </div>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categoryMap, router, askDelete]
  )

  const renderCard = (product: Product) => (
    <Card hoverable className='flex h-full flex-col overflow-hidden'>
      <button
        type='button'
        className='block aspect-square w-full shrink-0 overflow-hidden bg-surfaceSunken'
        onClick={() => router.push(`/products/${product.id}`)}
      >
        <img src={product.images?.[0]} alt='' className='size-full object-cover' />
      </button>
      <div className='flex flex-1 flex-col gap-1.5 p-3'>
        <div className='flex items-start justify-between gap-2'>
          <button
            type='button'
            className='min-w-0 truncate text-left text-sm font-medium text-textPrimary hover:underline'
            onClick={() => router.push(`/products/${product.id}`)}
          >
            {product.name}
          </button>
          <StatusChip value={product.inStock ? 'in-stock' : 'out-of-stock'} className='shrink-0' />
        </div>
        <span className='truncate text-xs text-textSecondary'>by {product.brand}</span>
        <div className='flex items-center gap-1.5'>
          <Rating value={product.rating} size='sm' />
          <span className='text-xs text-textMuted'>({product.reviewCount})</span>
        </div>
        <div className='mt-auto flex items-center justify-between pt-1.5'>
          <span className='text-sm font-semibold text-textPrimary'>
            {formatCurrency(product.price, product.currency)}
          </span>
          <div className='flex items-center gap-1'>
            <IconButton
              size='sm'
              variant='outlined'
              aria-label={`Edit ${product.name}`}
              onClick={() => router.push(`/products/${product.id}/edit`)}
            >
              <i className='tabler-edit' />
            </IconButton>
            <IconButton
              size='sm'
              variant='outlined'
              color='error'
              aria-label={`Delete ${product.name}`}
              onClick={() => askDelete(product)}
            >
              <i className='tabler-trash' />
            </IconButton>
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <>
      <Breadcrumbs />
      <PageHeader
        title='Products'
        subtitle='Manage your fragrance catalogue'
        action={
          <>
            <ExportButton
              filename='products'
              columns={exportColumns}
              fetchPage={(page, limit) => productsApi.list({ ...filters, page, limit })}
            />
            <Button startIcon={<i className='tabler-plus' />} onClick={() => router.push('/products/new')}>
              Add Product
            </Button>
          </>
        }
      />

      {isError && (
        <Alert severity='error' className='mb-4'>
          {(error as Error)?.message || 'Failed to load products.'}
        </Alert>
      )}

      <DataTable
        data={items}
        columns={columns}
        mobileCard={product => (
          <MobileRow
            title={
              <EntityCell
                name={product.name}
                subtitle={`by ${product.brand}`}
                image={product.images?.[0]}
                onClick={() => router.push(`/products/${product.id}`)}
              />
            }
            trailing={<StatusChip value={product.inStock ? 'in-stock' : 'out-of-stock'} />}
            meta={[formatCurrency(product.price, product.currency), `${product.reviewCount} reviews`]}
            actions={
              <>
                <IconButton
                  aria-label={`Edit ${product.name}`}
                  onClick={() => router.push(`/products/${product.id}/edit`)}
                >
                  <i className='tabler-edit' />
                </IconButton>
                <IconButton color='error' aria-label={`Delete ${product.name}`} onClick={() => askDelete(product)}>
                  <i className='tabler-trash' />
                </IconButton>
              </>
            }
          />
        )}
        total={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={isLoading}
        isRefetching={isFetching && !isLoading}
        emptyIcon='tabler-package-off'
        emptyMessage={hasFilters ? 'No products match these filters' : 'No products yet'}
        emptyDescription={
          hasFilters
            ? 'Try a broader search, or clear the category and scent filters.'
            : 'Add your first fragrance to start building the catalogue.'
        }
        emptyAction={
          hasFilters ? (
            <Button startIcon={<i className='tabler-x' />} variant='outlined' color='secondary' onClick={clearFilters}>
              Clear filters
            </Button>
          ) : (
            <Button startIcon={<i className='tabler-plus' />} onClick={() => router.push('/products/new')}>
              Add Product
            </Button>
          )
        }
        view={view}
        renderCard={renderCard}
        selection={{
          selected: selectedIds,
          onChange: setSelectedIds,
          getId: p => p.id,
          actions: (
            <Button size='sm' variant='outlined' color='error' onClick={() => setBulkConfirm(true)}>
              Delete
            </Button>
          )
        }}
        toolbar={
          <ProductsFilterBar
            search={search}
            onSearchChange={resetOnChange(setSearch)}
            categoryId={categoryId}
            onCategoryIdChange={resetOnChange(setCategoryId)}
            categories={categories ?? []}
            family={family}
            onFamilyChange={resetOnChange(setFamily)}
            stock={stock}
            onStockChange={resetOnChange(setStock)}
            priceRange={priceRange}
            onPriceRangeChange={resetOnChange(setPriceRange)}
            view={view}
            onViewChange={setView}
            hasFilters={hasFilters}
            onClearFilters={clearFilters}
          />
        }
      />

      {deleteDialog}
      <ConfirmDialog
        open={bulkConfirm}
        title='Delete products'
        description={`Delete ${selectedIds.size} selected product${selectedIds.size === 1 ? '' : 's'}? This cannot be undone.`}
        confirmText={`Delete ${selectedIds.size}`}
        loading={bulkDeleting}
        onConfirm={deleteSelected}
        onClose={() => setBulkConfirm(false)}
      />
    </>
  )
}

export default ProductsView
