'use client'

// Collections management — grid of collection cards, navigates to dedicated
// Create/Detail/Edit pages (product membership lives on the Detail page).
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import classnames from 'classnames'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import IconButton from '@/components/ui/IconButton'
import Skeleton from '@/components/ui/Skeleton'
import { humanize } from '@/libs/format'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { useCollections, useDeleteCollection } from '@/features/collections/hooks/useCollections'
import { accentSwatch } from '@/features/collections/accent'
import type { Collection } from '@/features/collections/types'

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
        icon='tabler-stack-2'
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
            <Card key={i} aria-hidden className='overflow-hidden'>
              <Skeleton variant='block' className='aspect-[4/3] w-full rounded-none' />
              <div className='flex flex-col gap-2 p-3'>
                <Skeleton className='h-5 w-2/3' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-1/2' />
              </div>
            </Card>
          ))
        ) : collections?.length ? (
          collections.map(collection => (
            <Card key={collection.id} hoverable className='flex h-full flex-col overflow-hidden'>
              <button
                type='button'
                aria-label={`Open ${collection.title}`}
                className='block aspect-[4/3] w-full shrink-0 overflow-hidden bg-surfaceSunken'
                onClick={() => router.push(`/collections/${collection.id}`)}
              >
                {collection.image && <img src={collection.image} alt='' className='size-full object-cover' />}
              </button>
              <div className='flex flex-1 flex-col gap-1.5 p-3'>
                <Link
                  href={`/collections/${collection.id}`}
                  className='truncate text-sm font-medium text-textPrimary hover:underline'
                >
                  {collection.title}
                </Link>
                <p className='truncate text-xs text-textSecondary'>{collection.subtitle}</p>
                <span className='flex items-center gap-1.5 text-xs text-textMuted'>
                  <span
                    aria-hidden
                    className={classnames(
                      'size-2.5 shrink-0 rounded-full ring-1 ring-richBlack/15',
                      accentSwatch[collection.accent]
                    )}
                  />
                  {humanize(collection.accent)}
                </span>
                <div className='mt-auto flex items-center justify-between pt-1.5'>
                  <span className='text-xs text-textMuted'>
                    {collection.productCount} {collection.productCount === 1 ? 'product' : 'products'}
                  </span>
                  <div className='flex items-center gap-1'>
                    <IconButton
                      size='sm'
                      variant='outlined'
                      aria-label={`Edit ${collection.title}`}
                      onClick={() => router.push(`/collections/${collection.id}/edit`)}
                    >
                      <i className='tabler-edit' />
                    </IconButton>
                    <IconButton
                      size='sm'
                      variant='outlined'
                      color='error'
                      aria-label={`Delete ${collection.title}`}
                      onClick={() => ask(collection)}
                    >
                      <i className='tabler-trash' />
                    </IconButton>
                  </div>
                </div>
              </div>
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
