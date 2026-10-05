'use client'

// Read-only category detail — image, tagline, sort order, SEO metadata.
import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DetailSection from '@/components/shared/DetailSection'
import DetailRow from '@/components/shared/DetailRow'
import DetailActions from '@/components/shared/DetailActions'
import ZoomableImage from '@/components/shared/ZoomableImage'
import QueryState from '@/components/shared/QueryState'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { useCategory, useDeleteCategory } from '@/features/categories/hooks/useCategories'
import type { Category } from '@/features/categories/types'

type Props = { id: string }

const CategoryDetailView = ({ id }: Props) => {
  const router = useRouter()
  const { data: category, isLoading, isError, error } = useCategory(id)
  const deleteMutation = useDeleteCategory()

  const { ask, dialog } = useConfirmDelete<Category>({
    entity: 'category',
    remove: c => deleteMutation.mutateAsync(c.id),
    name: c => c.name,
    onDeleted: () => router.push('/categories')
  })

  if (isLoading || !category) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Category' />
        <QueryState isError={isError} error={error} fallbackMessage='Failed to load category.' />
      </>
    )
  }

  return (
    <>
      <Breadcrumbs extra={[{ label: category.name }]} />
      <PageHeader
        title={category.name}
        subtitle={category.tagline}
        action={<DetailActions backHref='/categories' editHref={`/categories/${id}/edit`} onDelete={() => ask(category)} />}
      />

      <div className='flex flex-col gap-4'>
        <DetailSection title='Overview'>
          <DetailRow
            label='Image'
            stacked
            value={
              <ZoomableImage src={category.image} alt={category.name}>
                <img src={category.image} alt='' className='size-24 rounded-md object-cover' />
              </ZoomableImage>
            }
          />
          <DetailRow label='Tagline' value={category.tagline || '—'} />
          <DetailRow label='Products' value={category.productCount} />
          <DetailRow label='Sort order' value={category.sortOrder} />
        </DetailSection>

        {(category.slug || category.metaTitle || category.metaDescription || category.metaKeywords?.length) && (
          <DetailSection title='SEO'>
            <DetailRow label='Slug' value={category.slug || '—'} />
            <DetailRow label='Meta title' value={category.metaTitle || '—'} />
            <DetailRow label='Meta description' value={category.metaDescription || '—'} stacked />
            <DetailRow
              label='Meta keywords'
              value={category.metaKeywords?.length ? category.metaKeywords.join(', ') : '—'}
              stacked
            />
          </DetailSection>
        )}
      </div>

      {dialog}
    </>
  )
}

export default CategoryDetailView
