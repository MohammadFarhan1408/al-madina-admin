'use client'

import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import QueryState from '@/components/shared/QueryState'
import TagForm from '@/features/tags/components/TagForm'
import { useTag } from '@/features/tags/hooks/useTags'

type Props = { id: string }

const EditTagView = ({ id }: Props) => {
  const router = useRouter()
  const { data: tag, isLoading, isError, error, refetch } = useTag(id)

  if (isLoading || !tag) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Edit Tag' />
        <QueryState isError={isError} error={error} onRetry={() => refetch()} fallbackMessage='Failed to load tag.' />
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
