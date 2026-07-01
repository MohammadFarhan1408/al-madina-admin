'use client'

// Products management — server-paginated table with search/category/family
// filters, create/edit drawer, delete confirm.
import { useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import DataTable from '@/components/shared/DataTable'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import CustomTextField from '@core/components/mui/TextField'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useToast } from '@/contexts/ToastContext'
import { ApiError } from '@/libs/api/types'
import { formatCurrency, humanize } from '@/libs/format'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useDeleteProduct, useProducts } from '@/features/products/hooks/useProducts'
import ProductFormDrawer from '@/features/products/components/ProductFormDrawer'
import { SCENT_FAMILIES, type Product, type ScentFamily } from '@/features/products/types'

const ProductsView = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [family, setFamily] = useState<ScentFamily | ''>('')
  const debouncedSearch = useDebouncedValue(search)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [toDelete, setToDelete] = useState<Product | null>(null)

  const { data: categories } = useCategories()
  const deleteMutation = useDeleteProduct()
  const { success, error: toastError } = useToast()

  const categoryMap = useMemo(
    () => new Map((categories ?? []).map(c => [c.id, c.name])),
    [categories]
  )

  const { data, isLoading, isFetching, isError, error } = useProducts({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    q: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    family: family || undefined
  })

  const openCreate = () => {
    setEditing(null)
    setDrawerOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setDrawerOpen(true)
  }

  const confirmDelete = async () => {
    if (!toDelete) return

    try {
      await deleteMutation.mutateAsync(toDelete.id)
      success('Product deleted')
      setToDelete(null)
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to delete product')
    }
  }

  const columns = useMemo<ColumnDef<Product, any>[]>(
    () => [
      {
        header: 'Product',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Avatar variant='rounded' src={row.original.images?.[0]} />
            <div className='flex flex-col'>
              <Typography variant='subtitle2'>{row.original.name}</Typography>
              <Typography variant='caption' color='text.secondary'>
                {row.original.brand} · {row.original.volumeMl}ml
              </Typography>
            </div>
          </div>
        )
      },
      {
        header: 'Category',
        accessorKey: 'categoryId',
        cell: ({ getValue }) => categoryMap.get(getValue() as string) ?? '—'
      },
      {
        header: 'Family',
        accessorKey: 'scentFamily',
        cell: ({ getValue }) => humanize(getValue() as string)
      },
      {
        header: 'Price',
        accessorKey: 'price',
        cell: ({ row }) => formatCurrency(row.original.price, row.original.currency)
      },
      {
        header: 'Stock',
        accessorKey: 'inStock',
        cell: ({ getValue }) => <StatusChip value={(getValue() as boolean) ? 'active' : 'inactive'} />
      },
      {
        header: 'Badge',
        accessorKey: 'badge',
        cell: ({ getValue }) => <StatusChip value={getValue() as string} />
      },
      {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton size='small' onClick={() => openEdit(row.original)}>
              <i className='tabler-edit' />
            </IconButton>
            <IconButton size='small' color='error' onClick={() => setToDelete(row.original)}>
              <i className='tabler-trash' />
            </IconButton>
          </div>
        )
      }
    ],
    [categoryMap]
  )

  return (
    <>
      <PageHeader
        title='Products'
        subtitle='Manage your fragrance catalogue'
        action={
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={openCreate}>
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
        isLoading={isLoading || isFetching}
        emptyMessage='No products match your filters'
        toolbar={
          <Box className='flex flex-wrap items-center gap-4 p-6'>
            <CustomTextField
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPagination(p => ({ ...p, pageIndex: 0 }))
              }}
              placeholder='Search products'
              className='min-is-[220px]'
            />
            <CustomTextField
              select
              value={categoryId}
              onChange={e => {
                setCategoryId(e.target.value)
                setPagination(p => ({ ...p, pageIndex: 0 }))
              }}
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
              onChange={e => {
                setFamily(e.target.value as ScentFamily | '')
                setPagination(p => ({ ...p, pageIndex: 0 }))
              }}
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
          </Box>
        }
      />

      <ProductFormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} product={editing} />
      <ConfirmDialog
        open={!!toDelete}
        title='Delete product'
        description={`Delete "${toDelete?.name}"? This performs a soft delete.`}
        confirmText='Delete'
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}

export default ProductsView
