'use client'

// Products management — server-paginated table (or card grid) with
// search/category/family/stock/price filters, row selection with bulk
// delete, navigates to dedicated Create/Detail/Edit pages.
import { useEffect, useMemo, useState } from 'react'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import RowActions from '@/components/shared/RowActions'
import type { PriceRange } from '@/components/shared/PriceRangeFilter'
import Alert from '@/components/ui/Alert'
import IconButton from '@/components/ui/IconButton'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Checkbox from '@/components/ui/form/Checkbox'
import Rating from '@/components/ui/Rating'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useFilterReset } from '@/hooks/useFilterReset'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatCurrency } from '@/libs/format'
import { useCategories } from '@/features/categories/hooks/useCategories'
import ProductsFilterBar, { type ProductsView as ProductsListView, type StockFilter } from '@/features/products/components/ProductsFilterBar'
import { useDeleteProduct, useProducts } from '@/features/products/hooks/useProducts'
import type { Product, ScentFamily } from '@/features/products/types'

const ProductsView = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '')
  const [categoryId, setCategoryId] = useState(() => searchParams.get('categoryId') ?? '')
  const [family, setFamily] = useState<ScentFamily | ''>(() => (searchParams.get('family') as ScentFamily) ?? '')
  const [stock, setStock] = useState<StockFilter>('')
  const [priceRange, setPriceRange] = useState<PriceRange>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [view, setView] = useState<ProductsListView>('table')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const debouncedSearch = useDebouncedValue(search)
  const resetOnChange = useFilterReset(setPagination)

  const [toDelete, setToDelete] = useState<Product | null>(null)
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
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, categoryId, family])

  const categoryMap = useMemo(() => new Map((categories ?? []).map(c => [c.id, c.name])), [categories])

  const sort = sorting[0]?.id === 'price' ? (sorting[0].desc ? 'price_desc' : 'price_asc') : 'featured'

  const { data, isLoading, isFetching, isError, error } = useProducts({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    q: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    family: family || undefined,
    inStock: stock === '' ? undefined : stock === 'true',
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
    sort
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

  const confirmDelete = async () => {
    if (!toDelete) return

    try {
      await deleteMutation.mutateAsync(toDelete.id)
      success('Product deleted')
      setToDelete(null)
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to delete product'))
    }
  }

  const deleteSelected = async () => {
    setBulkDeleting(true)

    try {
      await Promise.all([...selectedIds].map(id => deleteMutation.mutateAsync(id)))
      success(`${selectedIds.size} product${selectedIds.size === 1 ? '' : 's'} deleted`)
      setSelectedIds(new Set())
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to delete the selected products'))
    } finally {
      setBulkDeleting(false)
    }
  }

  const toggleSelected = (id: string) =>
    setSelectedIds(prev => {
      const next = new Set(prev)

      if (next.has(id)) next.delete(id)
      else next.add(id)

      return next
    })

  const allOnPageSelected = items.length > 0 && items.every(item => selectedIds.has(item.id))

  const toggleSelectAll = () => setSelectedIds(allOnPageSelected ? new Set() : new Set(items.map(item => item.id)))

  const columns = useMemo<ColumnDef<Product, any>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            aria-label='Select all products on this page'
            checked={allOnPageSelected}
            onChange={toggleSelectAll}
          />
        ),
        enableSorting: false,
        size: 40,
        cell: ({ row }) => (
          <Checkbox
            aria-label={`Select ${row.original.name}`}
            checked={selectedIds.has(row.original.id)}
            onChange={() => toggleSelected(row.original.id)}
          />
        )
      },
      {
        header: 'Product',
        accessorKey: 'name',
        enableSorting: false,
        cell: ({ row }) => (
          <div
            className='flex min-w-0 cursor-pointer items-center gap-3'
            onClick={() => router.push(`/products/${row.original.id}`)}
          >
            <img src={row.original.images?.[0]} alt='' className='size-10 shrink-0 rounded-md object-cover' />
            <div className='flex min-w-0 flex-col'>
              <span className='truncate text-sm font-medium'>{row.original.name}</span>
              <span className='truncate text-xs text-textSecondary'>by {row.original.brand}</span>
            </div>
          </div>
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
                { text: 'Delete', icon: 'tabler-trash', danger: true, onClick: () => setToDelete(row.original) }
              ]}
            />
          </div>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categoryMap, router, selectedIds, allOnPageSelected]
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
              onClick={() => setToDelete(product)}
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
          <Button startIcon={<i className='tabler-plus' />} onClick={() => router.push('/products/new')}>
            Add Product
          </Button>
        }
      />

      {isError && (
        <Alert severity='error' className='mb-4'>
          {(error as Error)?.message || 'Failed to load products.'}
        </Alert>
      )}

      {selectedIds.size > 0 && (
        <Alert
          severity='warning'
          className='mb-4'
          action={
            <Button size='sm' variant='outlined' color='error' loading={bulkDeleting} onClick={deleteSelected}>
              Delete {selectedIds.size} selected
            </Button>
          }
        >
          {selectedIds.size} product{selectedIds.size === 1 ? '' : 's'} selected
        </Alert>
      )}

      <DataTable
        data={items}
        columns={columns}
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

      <ConfirmDialog
        open={!!toDelete}
        title='Delete product'
        description={`Delete "${toDelete?.name}"? This performs a soft delete — it can be restored from the database if needed.`}
        confirmText='Delete'
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}

export default ProductsView
