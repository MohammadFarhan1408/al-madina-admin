'use client'

// Read-only category detail — image, tagline, sort order, SEO metadata.
import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DetailSection from '@/components/shared/DetailSection'
import DetailRow from '@/components/shared/DetailRow'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import ZoomableImage from '@/components/shared/ZoomableImage'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { useCategory, useDeleteCategory } from '@/features/categories/hooks/useCategories'

type Props = { id: string }

const CategoryDetailView = ({ id }: Props) => {
  const router = useRouter()
  const { data: category, isLoading, isError, error } = useCategory(id)
  const deleteMutation = useDeleteCategory()
  const { success, error: toastError } = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = async () => {
    if (!category) return

    try {
      await deleteMutation.mutateAsync(category.id)
      success('Category deleted')
      router.push('/categories')
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to delete category'))
      setConfirmDelete(false)
    }
  }

  if (isLoading || !category) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Category' />
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
      <Breadcrumbs extra={[{ label: category.name }]} />
      <PageHeader
        title={category.name}
        subtitle={category.tagline}
        action={
          <div className='flex items-center gap-3'>
            <Button variant='tonal' color='secondary' onClick={() => router.push('/categories')}>
              Back
            </Button>
            <Button variant='tonal' startIcon={<i className='tabler-edit' />} onClick={() => router.push(`/categories/${id}/edit`)}>
              Edit
            </Button>
            <Button variant='tonal' color='error' startIcon={<i className='tabler-trash' />} onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          </div>
        }
      />

      <div className='flex flex-col gap-4'>
        <DetailSection title='Overview'>
          <DetailRow
            label='Image'
            stacked
            value={
              <ZoomableImage src={category.image} alt={category.name}>
                <Avatar variant='rounded' src={category.image} sx={{ width: 96, height: 96 }} />
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

      <ConfirmDialog
        open={confirmDelete}
        title='Delete category'
        description={`Delete "${category.name}"? This cannot be undone.`}
        confirmText='Delete'
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  )
}

export default CategoryDetailView
