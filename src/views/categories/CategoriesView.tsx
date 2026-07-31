'use client'

// Categories management — list (all, client-paginated), navigates to
// dedicated Create/Detail/Edit pages, delete confirm inline.
import { useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { ColumnDef } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import SearchField from '@/components/shared/SearchField'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import RowActions from '@/components/shared/RowActions'
import Alert from '@/components/ui/Alert'
import IconButton from '@/components/ui/IconButton'
import Button from '@/components/ui/Button'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { useCategories, useDeleteCategory } from '@/features/categories/hooks/useCategories'
import type { Category } from '@/features/categories/types'

const CategoriesView = () => {
  const router = useRouter()
  const { data: categories, isLoading, isError, error } = useCategories()
  const deleteMutation = useDeleteCategory()
  const { success, error: toastError } = useToast()

  const [search, setSearch] = useState('')
  const [toDelete, setToDelete] = useState<Category | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) return categories ?? []

    return (categories ?? []).filter(
      c => c.name.toLowerCase().includes(q) || (c.tagline ?? '').toLowerCase().includes(q)
    )
  }, [categories, search])

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
          <div
            className='flex cursor-pointer items-center gap-3'
            onClick={() => router.push(`/categories/${row.original.id}`)}
          >
            {row.original.image ? (
              <img src={row.original.image} alt='' className='size-10 rounded-md object-cover' />
            ) : (
              <span className='size-10 rounded-md bg-secondary/15' />
            )}
            <span className='text-sm font-medium'>{row.original.name}</span>
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
            <IconButton
              size='sm'
              aria-label={`View ${row.original.name}`}
              onClick={() => router.push(`/categories/${row.original.id}`)}
            >
              <i className='tabler-eye' />
            </IconButton>
            <RowActions
              options={[
                {
                  text: 'Edit',
                  icon: 'tabler-edit',
                  onClick: () => router.push(`/categories/${row.original.id}/edit`)
                },
                { text: 'Delete', icon: 'tabler-trash', danger: true, onClick: () => setToDelete(row.original) }
              ]}
            />
          </div>
        )
      }
    ],
    [router]
  )

  return (
    <>
      <Breadcrumbs />
      <PageHeader
        title='Categories'
        subtitle='Organize your fragrance catalogue'
        action={
          <Button startIcon={<i className='tabler-plus' />} onClick={() => router.push('/categories/new')}>
            Add Category
          </Button>
        }
      />

      {isError && (
        <Alert severity='error' className='mb-4'>
          {(error as Error)?.message || 'Failed to load categories.'}
        </Alert>
      )}

      <DataTable
        manualPagination={false}
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        emptyIcon='tabler-category'
        emptyMessage={search ? 'No categories match your search' : 'No categories yet'}
        emptyDescription={
          search
            ? 'Try a shorter or differently spelled term.'
            : 'Categories organise the catalogue into the sections customers browse.'
        }
        emptyAction={
          !search && (
            <Button startIcon={<i className='tabler-plus' />} onClick={() => router.push('/categories/new')}>
              Add Category
            </Button>
          )
        }
        toolbar={
          <>
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder='Search categories'
              className='min-w-56 flex-1'
            />
          </>
        }
      />

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
