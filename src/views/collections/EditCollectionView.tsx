'use client'

import { useRouter } from 'next/navigation'

import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import CollectionForm from '@/features/collections/components/CollectionForm'
import { useCollection } from '@/features/collections/hooks/useCollections'

type Props = { id: string }

const EditCollectionView = ({ id }: Props) => {
  const router = useRouter()
  const { data: collection, isLoading, isError, error } = useCollection(id)

  if (isLoading || !collection) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Edit Collection' />
        {isError ? (
          <Alert severity='error'>{(error as Error)?.message || 'Failed to load collection.'}</Alert>
        ) : (
          <div className='flex justify-center p-8'>
            <CircularProgress />
          </div>
        )}
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
