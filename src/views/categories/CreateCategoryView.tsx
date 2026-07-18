'use client'

import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import CategoryForm from '@/features/categories/components/CategoryForm'

const CreateCategoryView = () => {
  const router = useRouter()

  return (
    <>
      <Breadcrumbs extra={[{ label: 'New Category' }]} />
      <PageHeader title='New Category' subtitle='Add a category to your fragrance catalogue' />
      <CategoryForm
        onSuccess={category => router.push(`/categories/${category.id}`)}
        onCancel={() => router.push('/categories')}
      />
    </>
  )
}

export default CreateCategoryView
