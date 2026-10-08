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
import EntityCell from '@/components/shared/EntityCell'
import RowActions from '@/components/shared/RowActions'
import Alert from '@/components/ui/Alert'
import IconButton from '@/components/ui/IconButton'
import Button from '@/components/ui/Button'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { useCategories, useDeleteCategory } from '@/features/categories/hooks/useCategories'
import type { Category } from '@/features/categories/types'

const CategoriesView = () => {
  const router = useRouter()
  const { data: categories, isLoading, isError, error } = useCategories()
  const deleteMutation = useDeleteCategory()

  const [search, setSearch] = useState('')

  const { ask, dialog } = useConfirmDelete<Category>({
    entity: 'category',
    remove: c => deleteMutation.mutateAsync(c.id),
    name: c => c.name
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) return categories ?? []

    return (categories ?? []).filter(
      c => c.name.toLowerCase().includes(q) || (c.tagline ?? '').toLowerCase().includes(q)
    )
  }, [categories, search])

  const columns = useMemo<ColumnDef<Category, any>[]>(
    () => [
      {
        header: 'Category',
        accessorKey: 'name',
        cell: ({ row }) => (
          <EntityCell
            name={row.original.name}
            image={row.original.image}
            onClick={() => router.push(`/categories/${row.original.id}`)}
          />
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
                { text: 'Delete', icon: 'tabler-trash', danger: true, onClick: () => ask(row.original) }
              ]}
            />
          </div>
        )
      }
    ],
    [router, ask]
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
        mobileCard={category => (
          <div className='flex items-center justify-between gap-3'>
            <EntityCell
              name={category.name}
              subtitle={`${category.productCount} products`}
              image={category.image}
              onClick={() => router.push(`/categories/${category.id}`)}
            />
            <IconButton aria-label={`Edit ${category.name}`} onClick={() => router.push(`/categories/${category.id}/edit`)}>
              <i className='tabler-edit' />
            </IconButton>
          </div>
        )}
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

      {dialog}
    </>
  )
}

export default CategoriesView
