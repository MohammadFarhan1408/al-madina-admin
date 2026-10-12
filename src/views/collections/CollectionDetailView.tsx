'use client'

// Collection detail. Layout, top to bottom:
//   header  — title, subtitle, record ID/dates, Back/Delete/Edit
//   hero    — collection image (left) | accent, product count, sort order, slug
//   details — product membership: add-by-search + member table (wide) | SEO
import { useRouter } from 'next/navigation'

import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DetailActions from '@/components/shared/DetailActions'
import DetailLoading, { DetailHeroSkeleton } from '@/components/shared/DetailLoading'
import ImageGallery from '@/components/shared/ImageGallery'
import PageHeader from '@/components/shared/PageHeader'
import RecordMeta from '@/components/shared/RecordMeta'
import SeoCard from '@/components/shared/SeoCard'
import Card, { CardBody } from '@/components/ui/Card'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import CollectionProducts from '@/features/collections/components/detail/CollectionProducts'
import CollectionSummary from '@/features/collections/components/detail/CollectionSummary'
import { useCollection, useDeleteCollection } from '@/features/collections/hooks/useCollections'
import type { Collection } from '@/features/collections/types'

const CollectionDetailView = ({ id }: { id: string }) => {
  const router = useRouter()
  const { data: collection, isLoading, isError, error, refetch } = useCollection(id)
  const deleteMutation = useDeleteCollection()

  const { ask, dialog } = useConfirmDelete<Collection>({
    entity: 'collection',
    remove: c => deleteMutation.mutateAsync(c.id),
    name: c => c.title,
    onDeleted: () => router.push('/collections')
  })

  if (isLoading || !collection) {
    return (
      <DetailLoading
        title='Collection'
        skeleton={<DetailHeroSkeleton />}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        fallbackMessage='Failed to load collection.'
      />
    )
  }

  return (
    <>
      <Breadcrumbs extra={[{ label: collection.title }]} />
      <PageHeader
        title={collection.title}
        subtitle={collection.subtitle}
        action={
          <DetailActions
            backHref='/collections'
            backLabel='Back to collections'
            editHref={`/collections/${id}/edit`}
            editLabel='Edit collection'
            onDelete={() => ask(collection)}
          />
        }
      >
        <RecordMeta
          id={collection.id}
          idLabel='Collection ID'
          createdAt={collection.createdAt}
          updatedAt={collection.updatedAt}
        />
      </PageHeader>

      <div className='flex flex-col gap-5'>
        <Card>
          <CardBody padding='lg' className='grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]'>
            <ImageGallery
              images={collection.image ? [collection.image] : []}
              name={collection.title}
              aspect='landscape'
              emptyHint='Add an image from Edit — it represents the collection in the app.'
            />
            <CollectionSummary collection={collection} />
          </CardBody>
        </Card>

        <div className='grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
          <CollectionProducts collectionId={collection.id} title={collection.title} />
          <SeoCard
            showSlug={false}
            metaTitle={collection.metaTitle}
            metaDescription={collection.metaDescription}
            metaKeywords={collection.metaKeywords}
          />
        </div>
      </div>

      {dialog}
    </>
  )
}

export default CollectionDetailView
