'use client'

// Category detail (read-only). Layout, top to bottom:
//   header  — name, tagline, record ID/dates, Back/Delete/Edit
//   hero    — category image (left) | storefront facts (right)
//   details — the category's products (wide) | SEO
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
import CategoryProducts from '@/features/categories/components/detail/CategoryProducts'
import CategorySummary from '@/features/categories/components/detail/CategorySummary'
import { useCategory, useDeleteCategory } from '@/features/categories/hooks/useCategories'
import type { Category } from '@/features/categories/types'

const CategoryDetailView = ({ id }: { id: string }) => {
  const router = useRouter()
  const { data: category, isLoading, isError, error, refetch } = useCategory(id)
  const deleteMutation = useDeleteCategory()

  const { ask, dialog } = useConfirmDelete<Category>({
    entity: 'category',
    remove: c => deleteMutation.mutateAsync(c.id),
    name: c => c.name,
    description: c =>
      c.productCount > 0
        ? `Delete "${c.name}"? Its ${c.productCount} product${c.productCount === 1 ? '' : 's'} will be left without a category. This cannot be undone.`
        : `Delete "${c.name}"? This cannot be undone.`,
    onDeleted: () => router.push('/categories')
  })

  if (isLoading || !category) {
    return (
      <DetailLoading
        title='Category'
        backHref='/categories'
        backLabel='Back to categories'
        skeleton={<DetailHeroSkeleton />}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        fallbackMessage='Failed to load category.'
      />
    )
  }

  return (
    <>
      <Breadcrumbs extra={[{ label: category.name }]} />
      <PageHeader
        backHref='/categories'
        backLabel='Back to categories'
        title={category.name}
        subtitle={category.tagline}
        action={
          <DetailActions editHref={`/categories/${id}/edit`} editLabel='Edit category' onDelete={() => ask(category)} />
        }
      >
        <RecordMeta
          id={category.id}
          idLabel='Category ID'
          createdAt={category.createdAt}
          updatedAt={category.updatedAt}
        />
      </PageHeader>

      <div className='flex flex-col gap-5'>
        <Card>
          <CardBody padding='lg' className='grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]'>
            <ImageGallery
              images={category.image ? [category.image] : []}
              name={category.name}
              aspect='landscape'
              emptyHint='Add an image from Edit — it represents the category in the store.'
            />
            <CategorySummary category={category} />
          </CardBody>
        </Card>

        <div className='grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
          <CategoryProducts category={category} />
          <SeoCard
            showSlug={false}
            metaTitle={category.metaTitle}
            metaDescription={category.metaDescription}
            metaKeywords={category.metaKeywords}
          />
        </div>
      </div>

      {dialog}
    </>
  )
}

export default CategoryDetailView
