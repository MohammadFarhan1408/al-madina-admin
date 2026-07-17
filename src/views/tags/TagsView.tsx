'use client'

// Tags management — list (all, client-paginated), create/rename, delete.
import { useMemo, useState } from 'react'

import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
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
import { useTags, useDeleteTag } from '@/features/tags/hooks/useTags'
import TagFormDialog from '@/features/tags/components/TagFormDialog'
import type { Tag } from '@/features/tags/types'

const TagsView = () => {
  const { data: tags, isLoading, isError, error } = useTags()
  const deleteMutation = useDeleteTag()
  const { success, error: toastError } = useToast()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Tag | null>(null)
  const [toDelete, setToDelete] = useState<Tag | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    return q ? (tags ?? []).filter(t => t.name.toLowerCase().includes(q)) : (tags ?? [])
  }, [tags, search])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (tag: Tag) => {
    setEditing(tag)
    setFormOpen(true)
  }

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
            <IconButton size='small' aria-label={`Rename ${row.original.name}`} onClick={() => openEdit(row.original)}>
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
        title='Tags'
        subtitle='Reusable labels for product merchandising'
        action={
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={openCreate}>
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

      <TagFormDialog open={formOpen} onClose={() => setFormOpen(false)} tag={editing} />
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
