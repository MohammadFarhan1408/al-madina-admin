'use client'

// Collections management — grid of collection cards with edit / manage / delete.
import { useState } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'

import PageHeader from '@/components/shared/PageHeader'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import CornerFrame from '@/components/shared/CornerFrame'
import { useToast } from '@/contexts/ToastContext'
import { ApiError } from '@/libs/api/types'
import { useCollections, useDeleteCollection } from '@/features/collections/hooks/useCollections'
import CollectionFormDialog from '@/features/collections/components/CollectionFormDialog'
import ManageProductsDialog from '@/features/collections/components/ManageProductsDialog'
import type { Collection } from '@/features/collections/types'

const ACCENT_COLOR = { gold: 'warning', emerald: 'success', burgundy: 'error' } as const

const CollectionsView = () => {
  const { data: collections, isLoading, isError, error } = useCollections()
  const deleteMutation = useDeleteCollection()
  const { success, error: toastError } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Collection | null>(null)
  const [managing, setManaging] = useState<Collection | null>(null)
  const [toDelete, setToDelete] = useState<Collection | null>(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (collection: Collection) => {
    setEditing(collection)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!toDelete) return

    try {
      await deleteMutation.mutateAsync(toDelete.id)
      success('Collection deleted')
      setToDelete(null)
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to delete collection')
    }
  }

  return (
    <>
      <PageHeader
        eyebrow='Catalogue'
        title='Collections'
        subtitle='Curated groupings of your fragrances'
        action={
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={openCreate}>
            Add Collection
          </Button>
        }
      />

      {isError && <Alert severity='error' className='mbe-4'>{(error as Error)?.message || 'Failed to load collections.'}</Alert>}

      <Grid container spacing={6}>
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant='rounded' height={280} />
            </Grid>
          ))
        ) : collections?.length ? (
          collections.map(collection => (
            <Grid key={collection.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card className='bs-full flex flex-col'>
                <CornerFrame>
                  <CardMedia image={collection.image} sx={{ height: 160 }} />
                </CornerFrame>
                <CardContent className='flex flex-col gap-2 flex-1'>
                  <div className='flex items-center justify-between gap-2'>
                    <Typography variant='h6'>{collection.title}</Typography>
                    <StatusChip value={collection.accent} color={ACCENT_COLOR[collection.accent]} />
                  </div>
                  <Typography variant='body2' color='text.secondary'>
                    {collection.subtitle}
                  </Typography>
                  <Typography variant='caption' color='text.disabled'>
                    {collection.productCount} products
                  </Typography>
                  <div className='flex items-center gap-2 mbs-auto pbs-3'>
                    <Button size='small' variant='tonal' onClick={() => setManaging(collection)}>
                      Products
                    </Button>
                    <Button size='small' variant='tonal' color='secondary' onClick={() => openEdit(collection)}>
                      Edit
                    </Button>
                    <Button size='small' variant='tonal' color='error' onClick={() => setToDelete(collection)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid size={{ xs: 12 }}>
            <Typography color='text.secondary' className='text-center p-8'>
              No collections yet.
            </Typography>
          </Grid>
        )}
      </Grid>

      <CollectionFormDialog open={formOpen} onClose={() => setFormOpen(false)} collection={editing} />
      <ManageProductsDialog open={!!managing} onClose={() => setManaging(null)} collection={managing} />
      <ConfirmDialog
        open={!!toDelete}
        title='Delete collection'
        description={`Delete "${toDelete?.title}"? This cannot be undone.`}
        confirmText='Delete'
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}

export default CollectionsView
