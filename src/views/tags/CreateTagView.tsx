'use client'

import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import TagForm from '@/features/tags/components/TagForm'

const CreateTagView = () => {
  const router = useRouter()

  return (
    <>
      <Breadcrumbs extra={[{ label: 'New Tag' }]} />
      <PageHeader title='New Tag' subtitle='Add a new product tag' />
      <TagForm onSuccess={() => router.push('/tags')} onCancel={() => router.push('/tags')} />
    </>
  )
}

export default CreateTagView
