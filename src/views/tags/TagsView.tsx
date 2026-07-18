'use client'

// Tags management — list (all, client-paginated), navigates to dedicated
// Create/Edit pages (no Detail page — a single name field), delete.
import { useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import type { ColumnDef } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import SearchField from '@/components/shared/SearchField'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import OptionMenu from '@core/components/option-menu'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { useTags, useDeleteTag } from '@/features/tags/hooks/useTags'
import type { Tag } from '@/features/tags/types'

const TagsView = () => {
  const router = useRouter()
  const { data: tags, isLoading, isError, error } = useTags()
  const deleteMutation = useDeleteTag()
  const { success, error: toastError } = useToast()

  const [search, setSearch] = useState('')
  const [toDelete, setToDelete] = useState<Tag | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    return q ? (tags ?? []).filter(t => t.name.toLowerCase().includes(q)) : (tags ?? [])
  }, [tags, search])

  const confirmDelete = async () => {
    if (!toDelete) return

    try {
      await deleteMutation.mutateAsync(toDelete.id)
      success('Tag deleted')
      setToDelete(null)
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to delete tag'))
    }
  }

  const columns = useMemo<ColumnDef<Tag, any>[]>(
    () => [
      { header: 'Name', accessorKey: 'name', cell: ({ getValue }) => <Typography variant='subtitle2'>{getValue() as string}</Typography> },
      { header: 'Slug', accessorKey: 'slug', enableSorting: false },
      {
        header: 'Actions',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className='flex items-center justify-end'>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Rename',
                  icon: 'tabler-edit',
                  menuItemProps: { onClick: () => router.push(`/tags/${row.original.id}/edit`) }
                },
                { text: 'Delete', icon: 'tabler-trash', menuItemProps: { onClick: () => setToDelete(row.original) } }
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
        title='Tags'
        subtitle='Reusable labels for product merchandising'
        action={
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => router.push('/tags/new')}>
            Add Tag
          </Button>
        }
      />

      {isError && <Alert severity='error' className='mbe-4'>{(error as Error)?.message || 'Failed to load tags.'}</Alert>}

      <DataTable
        manualPagination={false}
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={search ? 'No tags match your search' : 'No tags yet.'}
        toolbar={
          <Box className='flex flex-wrap items-center gap-4 p-6'>
            <SearchField value={search} onChange={setSearch} placeholder='Search tags' className='min-is-[220px]' />
          </Box>
        }
      />

      <ConfirmDialog
        open={!!toDelete}
        title='Delete tag'
        description={`Delete "${toDelete?.name}"? Products using it will simply lose the tag.`}
        confirmText='Delete'
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}

export default TagsView
