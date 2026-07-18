'use client'

import { useRouter } from 'next/navigation'

import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
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
        {isError ? (
          <Alert severity='error'>{(error as Error)?.message || 'Failed to load category.'}</Alert>
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
