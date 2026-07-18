'use client'

// Products management — server-paginated table with search/category/family
// filters, navigates to dedicated Create/Detail/Edit pages, delete confirm.
import { useEffect, useMemo, useState } from 'react'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import SearchField from '@/components/shared/SearchField'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import CustomTextField from '@core/components/mui/TextField'
import OptionMenu from '@core/components/option-menu'
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
            className='flex items-center gap-3 min-is-0 cursor-pointer'
            onClick={() => router.push(`/products/${row.original.id}`)}
          >
            <Avatar variant='rounded' src={row.original.images?.[0]} />
            <div className='flex flex-col min-is-0'>
              <Typography variant='subtitle2' noWrap>
                {row.original.name}
              </Typography>
              <Typography variant='caption' color='text.secondary' noWrap>
                {row.original.brand} · {row.original.volumeMl}ml
              </Typography>
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
            <IconButton
              size='small'
              aria-label={`View ${row.original.name}`}
              onClick={() => router.push(`/products/${row.original.id}`)}
            >
              <i className='tabler-eye' />
            </IconButton>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                { text: 'Edit', icon: 'tabler-edit', menuItemProps: { onClick: () => router.push(`/products/${row.original.id}/edit`) } },
                { text: 'Delete', icon: 'tabler-trash', menuItemProps: { onClick: () => setToDelete(row.original) } }
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
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => router.push('/products/new')}>
            Add Product
          </Button>
        }
      />

      {isError && <Alert severity='error' className='mbe-4'>{(error as Error)?.message || 'Failed to load products.'}</Alert>}

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
          <Box className='flex flex-wrap items-center gap-4 p-6'>
            <SearchField
              value={search}
              onChange={resetOnChange(setSearch)}
              placeholder='Search products'
              className='min-is-[220px]'
            />
            <CustomTextField
              select
              value={categoryId}
              onChange={e => resetOnChange(setCategoryId)(e.target.value)}
              className='min-is-[180px]'
              label='Category'
            >
              <MenuItem value=''>All categories</MenuItem>
              {(categories ?? []).map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </CustomTextField>
            <CustomTextField
              select
              value={family}
              onChange={e => resetOnChange(setFamily)(e.target.value as ScentFamily | '')}
              className='min-is-[160px]'
              label='Scent family'
            >
              <MenuItem value=''>All families</MenuItem>
              {SCENT_FAMILIES.map(f => (
                <MenuItem key={f} value={f}>
                  {humanize(f)}
                </MenuItem>
              ))}
            </CustomTextField>
            {hasFilters && (
              <Button size='small' color='secondary' onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </Box>
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
