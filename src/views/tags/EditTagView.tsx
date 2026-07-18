'use client'

import { useRouter } from 'next/navigation'

import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import TagForm from '@/features/tags/components/TagForm'
import { useTag } from '@/features/tags/hooks/useTags'

type Props = { id: string }

const EditTagView = ({ id }: Props) => {
  const router = useRouter()
  const { data: tag, isLoading, isError, error } = useTag(id)

  if (isLoading || !tag) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Edit Tag' />
        {isError ? (
          <Alert severity='error'>{(error as Error)?.message || 'Failed to load tag.'}</Alert>
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
      <Breadcrumbs extra={[{ label: tag.name, href: '/tags' }, { label: 'Edit' }]} />
      <PageHeader title={`Edit ${tag.name}`} />
      <TagForm tag={tag} onSuccess={() => router.push('/tags')} onCancel={() => router.push('/tags')} />
    </>
  )
}

export default EditTagView
