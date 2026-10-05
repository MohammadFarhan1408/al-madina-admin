'use client'

// Tags management — list (all, client-paginated). Create/rename happen in a
// dialog (a tag is one name field); delete confirms inline.
import { useMemo, useState } from 'react'

import type { ColumnDef } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import SearchField from '@/components/shared/SearchField'
import RowActions from '@/components/shared/RowActions'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import TagFormDialog from '@/features/tags/components/TagFormDialog'
import { useTags, useDeleteTag } from '@/features/tags/hooks/useTags'
import type { Tag } from '@/features/tags/types'

const TagsView = () => {
  const { data: tags, isLoading, isError, error } = useTags()
  const deleteMutation = useDeleteTag()

  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<{ tag?: Tag } | null>(null)

  const { ask, dialog } = useConfirmDelete<Tag>({
    entity: 'tag',
    remove: t => deleteMutation.mutateAsync(t.id),
    name: t => t.name
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    return q ? (tags ?? []).filter(t => t.name.toLowerCase().includes(q)) : (tags ?? [])
  }, [tags, search])

  const columns = useMemo<ColumnDef<Tag, any>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ getValue }) => <span className='text-sm font-medium'>{getValue() as string}</span>
      },
      { header: 'Slug', accessorKey: 'slug', enableSorting: false },
      {
        header: 'Actions',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className='flex items-center justify-end'>
            <RowActions
              options={[
                { text: 'Rename', icon: 'tabler-edit', onClick: () => setEditing({ tag: row.original }) },
                { text: 'Delete', icon: 'tabler-trash', danger: true, onClick: () => ask(row.original) }
              ]}
            />
          </div>
        )
      }
    ],
    [ask]
  )

  return (
    <>
      <Breadcrumbs />
      <PageHeader
        title='Tags'
        subtitle='Reusable labels for product merchandising'
        action={
          <Button startIcon={<i className='tabler-plus' />} onClick={() => setEditing({})}>
            Add Tag
          </Button>
        }
      />

      {isError && (
        <Alert severity='error' className='mb-4'>
          {(error as Error)?.message || 'Failed to load tags.'}
        </Alert>
      )}

      <DataTable
        manualPagination={false}
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        emptyIcon='tabler-tag-off'
        emptyMessage={search ? 'No tags match your search' : 'No tags yet'}
        emptyDescription={
          search
            ? 'Try a shorter or differently spelled term.'
            : 'Tags help customers filter the catalogue by note and mood.'
        }
        emptyAction={
          !search && (
            <Button startIcon={<i className='tabler-plus' />} onClick={() => setEditing({})}>
              Add Tag
            </Button>
          )
        }
        toolbar={
          <>
            <SearchField value={search} onChange={setSearch} placeholder='Search tags' className='min-w-56 flex-1' />
          </>
        }
      />

      {dialog}
      {editing && <TagFormDialog tag={editing.tag} onClose={() => setEditing(null)} />}
    </>
  )
}

export default TagsView
