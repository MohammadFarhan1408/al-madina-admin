'use client'

import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import QueryState from '@/components/shared/QueryState'
import CollectionForm from '@/features/collections/components/CollectionForm'
import { useCollection } from '@/features/collections/hooks/useCollections'

type Props = { id: string }

const EditCollectionView = ({ id }: Props) => {
  const router = useRouter()
  const { data: collection, isLoading, isError, error, refetch } = useCollection(id)

  if (isLoading || !collection) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Edit Collection' />
        <QueryState isError={isError} error={error} onRetry={() => refetch()} fallbackMessage='Failed to load collection.' />
      </>
    )
  }

  return (
    <>
      <Breadcrumbs extra={[{ label: collection.title, href: `/collections/${id}` }, { label: 'Edit' }]} />
      <PageHeader title={`Edit ${collection.title}`} />
      <CollectionForm
        collection={collection}
        onSuccess={() => router.push(`/collections/${id}`)}
        onCancel={() => router.push(`/collections/${id}`)}
      />
    </>
  )
}

export default EditCollectionView
