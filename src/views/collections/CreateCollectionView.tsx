'use client'

import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import CollectionForm from '@/features/collections/components/CollectionForm'

const CreateCollectionView = () => {
  const router = useRouter()

  return (
    <>
      <Breadcrumbs extra={[{ label: 'New Collection' }]} />
      <PageHeader title='New Collection' subtitle='Curate a new fragrance collection' />
      <CollectionForm
        onSuccess={collection => router.push(`/collections/${collection.id}`)}
        onCancel={() => router.push('/collections')}
      />
    </>
  )
}

export default CreateCollectionView
