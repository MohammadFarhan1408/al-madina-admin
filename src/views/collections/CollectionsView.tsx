'use client'

// Collections management — grid of collection cards, navigates to dedicated
// Create/Detail/Edit pages (product membership lives on the Detail page).
import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { useCollections, useDeleteCollection } from '@/features/collections/hooks/useCollections'
import CollectionCard, { CollectionCardSkeleton } from '@/features/collections/components/CollectionCard'
import type { Collection } from '@/features/collections/types'

// ponytail: one row's worth; not breakpoint-aware, bump if the grid changes.
const SKELETON_COUNT = 4

const CollectionsView = () => {
  const router = useRouter()
  const { data: collections, isLoading, isError, error, refetch } = useCollections()
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
        icon='tabler-stack-2'
        subtitle='Curated groupings of your fragrances'
        action={
          <Button startIcon={<i className='tabler-plus' />} onClick={() => router.push('/collections/new')}>
            Add Collection
          </Button>
        }
      />

      <div className='grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5'>
        {isLoading ? (
          [...Array(SKELETON_COUNT)].map((_, i) => <CollectionCardSkeleton key={i} />)
        ) : isError ? (
          <Card className='col-span-full'>
            <EmptyState
              icon='tabler-alert-triangle'
              title="Couldn't load collections"
              description={(error as Error)?.message || 'Something went wrong while loading this list.'}
              action={
                <Button variant='outlined' startIcon={<i className='tabler-refresh' />} onClick={() => refetch()}>
                  Try again
                </Button>
              }
            />
          </Card>
        ) : collections?.length ? (
          collections.map(collection => (
            <CollectionCard
              key={collection.id}
              title={collection.title}
              subtitle={collection.subtitle}
              image={collection.image}
              accent={collection.accent}
              productCount={collection.productCount}
              sortOrder={collection.sortOrder}
              href={`/collections/${collection.id}`}
              onEdit={() => router.push(`/collections/${collection.id}/edit`)}
              onDelete={() => ask(collection)}
            />
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
