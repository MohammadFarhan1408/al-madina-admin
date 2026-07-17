'use client'

// Categories management — list (all, client-paginated), create/edit dialog,
// delete confirm. Uses the shared DataTable in client mode: the full list is
// already fetched (small dataset), so search/sort/pagination run in-browser.
import { useMemo, useState } from 'react'

import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import type { ColumnDef } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import SearchField from '@/components/shared/SearchField'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { useCategories, useDeleteCategory } from '@/features/categories/hooks/useCategories'
import CategoryFormDialog from '@/features/categories/components/CategoryFormDialog'
import type { Category } from '@/features/categories/types'

const CategoriesView = () => {
  const { data: categories, isLoading, isError, error } = useCategories()
  const deleteMutation = useDeleteCategory()
  const { success, error: toastError } = useToast()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [toDelete, setToDelete] = useState<Category | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) return categories ?? []

    return (categories ?? []).filter(
      c => c.name.toLowerCase().includes(q) || (c.tagline ?? '').toLowerCase().includes(q)
    )
  }, [categories, search])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditing(category)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!toDelete) return

    try {
      await deleteMutation.mutateAsync(toDelete.id)
      success('Category deleted')
      setToDelete(null)
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to delete category'))
    }
  }

  const columns = useMemo<ColumnDef<Category, any>[]>(
    () => [
      {
        header: 'Category',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Avatar variant='rounded' src={row.original.image} />
            <Typography variant='subtitle2'>{row.original.name}</Typography>
          </div>
        )
      },
      {
        header: 'Tagline',
        accessorKey: 'tagline',
        enableSorting: false,
        cell: ({ getValue }) => (getValue() as string) || '—'
      },
      { header: 'Products', accessorKey: 'productCount', meta: { align: 'right' } },
      { header: 'Sort', accessorKey: 'sortOrder', meta: { align: 'right' } },
      {
        header: 'Actions',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className='flex items-center justify-end'>
            <IconButton size='small' aria-label={`Edit ${row.original.name}`} onClick={() => openEdit(row.original)}>
              <i className='tabler-edit' />
            </IconButton>
            <IconButton size='small' color='error' aria-label={`Delete ${row.original.name}`} onClick={() => setToDelete(row.original)}>
              <i className='tabler-trash' />
            </IconButton>
          </div>
        )
      }
    ],
    []
  )

  return (
    <>
      <Breadcrumbs />
      <PageHeader
        title='Categories'
        subtitle='Organize your fragrance catalogue'
        action={
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={openCreate}>
            Add Category
          </Button>
        }
      />

      {isError && <Alert severity='error' className='mbe-4'>{(error as Error)?.message || 'Failed to load categories.'}</Alert>}

      <DataTable
        manualPagination={false}
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={search ? 'No categories match your search' : 'No categories yet.'}
        toolbar={
          <Box className='flex flex-wrap items-center gap-4 p-6'>
            <SearchField value={search} onChange={setSearch} placeholder='Search categories' className='min-is-[220px]' />
          </Box>
        }
      />

      <CategoryFormDialog open={formOpen} onClose={() => setFormOpen(false)} category={editing} />
      <ConfirmDialog
        open={!!toDelete}
        title='Delete category'
        description={`Delete "${toDelete?.name}"? This cannot be undone.`}
        confirmText='Delete'
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}

export default CategoriesView
