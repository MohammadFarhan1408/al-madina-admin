'use client'

// Products management — server-paginated table with search/category/family
// filters, navigates to dedicated Create/Detail/Edit pages, delete confirm.
import { useEffect, useMemo, useState } from 'react'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import SearchField from '@/components/shared/SearchField'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import RowActions from '@/components/shared/RowActions'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useFilterReset } from '@/hooks/useFilterReset'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatCurrency, humanize } from '@/libs/format'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useDeleteProduct, useProducts } from '@/features/products/hooks/useProducts'
import { SCENT_FAMILIES, type Product, type ScentFamily } from '@/features/products/types'

const ProductsView = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '')
  const [categoryId, setCategoryId] = useState(() => searchParams.get('categoryId') ?? '')
  const [family, setFamily] = useState<ScentFamily | ''>(() => (searchParams.get('family') as ScentFamily) ?? '')
  const [sorting, setSorting] = useState<SortingState>([])
  const debouncedSearch = useDebouncedValue(search)
  const resetOnChange = useFilterReset(setPagination)

  const [toDelete, setToDelete] = useState<Product | null>(null)

  const { data: categories } = useCategories()
  const deleteMutation = useDeleteProduct()
  const { success, error: toastError } = useToast()

  // Keep category/family filters in the URL, matching the existing `q` sync.
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
    sort
  })

  const hasFilters = Boolean(search || categoryId || family)

  const clearFilters = () => {
    setSearch('')
    setCategoryId('')
    setFamily('')
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

  const columns = useMemo<ColumnDef<Product, any>[]>(
    () => [
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
              <span className='truncate text-xs text-textSecondary'>
                {row.original.brand} · {row.original.volumeMl}ml
              </span>
            </div>
          </div>
        )
      },
      {
        header: 'Category',
        accessorKey: 'categoryId',
        enableSorting: false,
        cell: ({ getValue }) => categoryMap.get(getValue() as string) ?? '—'
      },
      {
        header: 'Family',
        accessorKey: 'scentFamily',
        enableSorting: false,
        cell: ({ getValue }) => humanize(getValue() as string)
      },
      {
        header: 'Price',
        accessorKey: 'price',
        meta: { align: 'right' },
        cell: ({ row }) => formatCurrency(row.original.price, row.original.currency)
      },
      {
        header: 'Stock',
        accessorKey: 'inStock',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ getValue }) => <StatusChip value={(getValue() as boolean) ? 'in-stock' : 'out-of-stock'} />
      },
      {
        header: 'Badge',
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
            <button
              type='button'
              aria-label={`View ${row.original.name}`}
              onClick={() => router.push(`/products/${row.original.id}`)}
              className='rounded-md p-1.5 text-textSecondary hover:bg-primary/10'
            >
              <i className='tabler-eye' />
            </button>
            <RowActions
              options={[
                { text: 'Edit', icon: 'tabler-edit', onClick: () => router.push(`/products/${row.original.id}/edit`) },
                { text: 'Delete', icon: 'tabler-trash', danger: true, onClick: () => setToDelete(row.original) }
              ]}
            />
          </div>
        )
      }
    ],
    [categoryMap, router]
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

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        total={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={isLoading}
        isRefetching={isFetching && !isLoading}
        emptyMessage='No products match your filters'
        toolbar={
          <div className='flex flex-wrap items-center gap-4 p-6'>
            <SearchField
              value={search}
              onChange={resetOnChange(setSearch)}
              placeholder='Search products'
              className='min-w-[220px]'
            />
            <Select
              label='Category'
              value={categoryId}
              onChange={e => resetOnChange(setCategoryId)(e.target.value)}
              containerClassName='min-w-[180px]'
              options={[
                { label: 'All categories', value: '' },
                ...(categories ?? []).map(category => ({ label: category.name, value: category.id }))
              ]}
            />
            <Select
              label='Scent family'
              value={family}
              onChange={e => resetOnChange(setFamily)(e.target.value as ScentFamily | '')}
              containerClassName='min-w-[160px]'
              options={[
                { label: 'All families', value: '' },
                ...SCENT_FAMILIES.map(f => ({ label: humanize(f), value: f }))
              ]}
            />
            {hasFilters && (
              <Button size='sm' variant='text' color='secondary' onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
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
