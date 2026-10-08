'use client'

// Collections management — grid of collection cards, navigates to dedicated
// Create/Detail/Edit pages (product membership lives on the Detail page).
import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import StatusChip from '@/components/shared/StatusChip'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card, { CardBody } from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { useCollections, useDeleteCollection } from '@/features/collections/hooks/useCollections'
import type { Collection } from '@/features/collections/types'

const ACCENT_COLOR = { gold: 'warning', emerald: 'success', burgundy: 'error' } as const

// ponytail: one row's worth; not breakpoint-aware, bump if the grid changes.
const SKELETON_COUNT = 4

const CollectionsView = () => {
  const router = useRouter()
  const { data: collections, isLoading, isError, error } = useCollections()
  const deleteMutation = useDeleteCollection()

  const { ask, dialog } = useConfirmDelete<Collection>({
    entity: 'collection',
    remove: c => deleteMutation.mutateAsync(c.id),
    name: c => c.title
  })

  return (
    <>
      <Breadcrumbs />
      <PageHeader
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

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        {isLoading ? (
          [...Array(SKELETON_COUNT)].map((_, i) => (
            <Skeleton key={i} variant='block' className='h-[280px] rounded-lg' />
          ))
        ) : collections?.length ? (
          collections.map(collection => (
            <Card key={collection.id} className='flex h-full flex-col'>
              <div
                className='h-60 rounded-t-lg bg-cover bg-center'
                style={{ backgroundImage: `url(${collection.image})` }}
              />
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
                  <Button size='sm' variant='outlined' color='error' onClick={() => ask(collection)}>
                    Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <Card className='col-span-full'>
            <EmptyState
              icon='tabler-stack-2'
              title='No collections yet'
              description='Collections group fragrances into curated sets customers can browse.'
              action={
                <Button startIcon={<i className='tabler-plus' />} onClick={() => router.push('/collections/new')}>
                  Add Collection
                </Button>
              }
            />
          </Card>
        )}
      </div>

      {dialog}
    </>
  )
}

export default CollectionsView
