'use client'

import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import QueryState from '@/components/shared/QueryState'
import CategoryForm from '@/features/categories/components/CategoryForm'
import { useCategory } from '@/features/categories/hooks/useCategories'

type Props = { id: string }

const EditCategoryView = ({ id }: Props) => {
  const router = useRouter()
  const { data: category, isLoading, isError, error } = useCategory(id)

  if (isLoading || !category) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Edit Category' />
        <QueryState isError={isError} error={error} fallbackMessage='Failed to load category.' />
      </>
    )
  }

  return (
    <>
      <Breadcrumbs extra={[{ label: category.name, href: `/categories/${id}` }, { label: 'Edit' }]} />
      <PageHeader title={`Edit ${category.name}`} />
      <CategoryForm
        category={category}
        onSuccess={() => router.push(`/categories/${id}`)}
        onCancel={() => router.push(`/categories/${id}`)}
      />
    </>
  )
}

export default EditCategoryView
