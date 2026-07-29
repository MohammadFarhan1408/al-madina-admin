'use client'

// Collections management — grid of collection cards, navigates to dedicated
// Create/Detail/Edit pages (product membership lives on the Detail page).
import { useState } from 'react'

import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import CornerFrame from '@/components/shared/CornerFrame'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card, { CardBody } from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { useCollections, useDeleteCollection } from '@/features/collections/hooks/useCollections'
import type { Collection } from '@/features/collections/types'

const ACCENT_COLOR = { gold: 'warning', emerald: 'success', burgundy: 'error' } as const

// ponytail: matches the md:4 (3-per-row) grid below; not breakpoint-aware,
// bump if the grid's column count changes.
const SKELETON_COUNT = 3

const CollectionsView = () => {
  const router = useRouter()
  const { data: collections, isLoading, isError, error } = useCollections()
  const deleteMutation = useDeleteCollection()
  const { success, error: toastError } = useToast()

  const [toDelete, setToDelete] = useState<Collection | null>(null)

  const confirmDelete = async () => {
    if (!toDelete) return

    try {
      await deleteMutation.mutateAsync(toDelete.id)
      success('Collection deleted')
      setToDelete(null)
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to delete collection'))
    }
  }

  return (
    <>
      <Breadcrumbs />
      <PageHeader
        eyebrow='Catalogue'
        title='Collections'
        subtitle='Curated groupings of your fragrances'
        action={
          <Button startIcon={<i className='tabler-plus' />} onClick={() => router.push('/collections/new')}>
            Add Collection
          </Button>
        }
      />

      {isError && (
        <Alert severity='error' className='mb-4'>
          {(error as Error)?.message || 'Failed to load collections.'}
        </Alert>
      )}

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3'>
        {isLoading ? (
          [...Array(SKELETON_COUNT)].map((_, i) => (
            <div key={i} className='h-[280px] animate-pulse rounded-lg bg-textDisabled/20' />
          ))
        ) : collections?.length ? (
          collections.map(collection => (
            <Card key={collection.id} className='flex h-full flex-col'>
              <CornerFrame>
                <div
                  className='h-40 rounded-t-lg bg-cover bg-center'
                  style={{ backgroundImage: `url(${collection.image})` }}
                />
              </CornerFrame>
              <CardBody className='flex flex-1 flex-col gap-2'>
                <div className='flex items-center justify-between gap-2'>
                  <h2 className='text-base font-semibold'>{collection.title}</h2>
                  <StatusChip value={collection.accent} color={ACCENT_COLOR[collection.accent]} />
                </div>
                <p className='text-sm text-textSecondary'>{collection.subtitle}</p>
                <span className='text-xs text-textDisabled'>{collection.productCount} products</span>
                <div className='mt-auto flex flex-wrap items-center gap-2 pt-3'>
                  <Button size='sm' variant='outlined' onClick={() => router.push(`/collections/${collection.id}`)}>
                    Products
                  </Button>
                  <Button
                    size='sm'
                    variant='outlined'
                    color='secondary'
                    onClick={() => router.push(`/collections/${collection.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button size='sm' variant='outlined' color='error' onClick={() => setToDelete(collection)}>
                    Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <p className='col-span-full p-8 text-center text-textSecondary'>No collections yet.</p>
        )}
      </div>

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
