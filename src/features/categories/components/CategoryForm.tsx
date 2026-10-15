'use client'

// Create/edit category form. RHF + Zod, image via shared ImageUpload. Hosted
// directly by the /categories/new and /categories/[id]/edit pages — no
// Dialog chrome, that's the page shell's job now.
import { useState } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Input from '@/components/ui/form/Input'
import NumberInput from '@/components/ui/form/NumberInput'
import FormActions from '@/components/shared/FormActions'
import ImageUpload from '@/components/shared/ImageUpload'
import SeoFieldsSection from '@/components/shared/SeoFieldsSection'
import CharCount from '@/components/shared/CharCount'
import FormLayout from '@/components/shared/FormLayout'
import { useInvalidSubmit } from '@/hooks/useInvalidSubmit'
import { useFormSync } from '@/hooks/useFormSync'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { categorySchema, defaultCategoryValues, type CategoryFormValues } from '../schema'
import { useCreateCategory, useUpdateCategory } from '../hooks/useCategories'
import type { Category } from '../types'

type Props = {
  category?: Category | null
  onSuccess: (category: Category) => void
  onCancel: () => void
}

const CategoryForm = ({ category, onSuccess, onCancel }: Props) => {
  const { success, error } = useToast()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const [imageUploading, setImageUploading] = useState(false)
  const isEdit = !!category

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultCategoryValues
  })

  useFormSync(
    reset,
    category,
    c => ({
      name: c.name,
      tagline: c.tagline ?? '',
      image: c.image,
      sortOrder: c.sortOrder,
      slug: c.slug ?? '',
      metaTitle: c.metaTitle ?? '',
      metaDescription: c.metaDescription ?? '',
      metaKeywords: c.metaKeywords ?? []
    }),
    defaultCategoryValues
  )

  const [name, tagline, image] = watch(['name', 'tagline', 'image'])
  const onInvalid = useInvalidSubmit<CategoryFormValues>()

  const onSubmit = async (values: CategoryFormValues) => {
    const payload = {
      ...values,
      slug: values.slug || undefined,
      metaTitle: values.metaTitle || undefined,
      metaDescription: values.metaDescription || undefined
    }

    try {
      if (isEdit && category) {
        const updated = await updateMutation.mutateAsync({ id: category.id, body: payload })

        success('Category updated')
        onSuccess(updated)
      } else {
        const created = await createMutation.mutateAsync(payload)

        success('Category created')
        onSuccess(created)
      }
    } catch (err) {
      error(getErrorMessage(err, 'Something went wrong'))
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending || imageUploading

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
      <FormLayout
        stickyAside
        aside={
          <Card>
            <CardHeader title='Preview' icon='tabler-eye' description='The category as a tile' />
            <CardBody>
              <CategoryPreview name={name} tagline={tagline} image={image} productCount={category?.productCount} />
            </CardBody>
          </Card>
        }
      >
        <Card>
          <CardHeader title='Details' icon='tabler-info-circle' description='Name and the line shown under it' />
          <CardBody className='flex flex-col gap-5'>
            <Controller
              name='name'
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  required
                  label='Name'
                  placeholder='e.g. Oud Perfumes'
                  error={errors.name?.message}
                  helperText={<CharCount value={field.value} recommended={32} />}
                />
              )}
            />
            <Controller
              name='tagline'
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ''}
                  label='Tagline'
                  placeholder='A short line that sets the mood'
                  helperText={
                    <span className='flex flex-1 justify-between gap-3'>
                      <span>Optional.</span>
                      <CharCount value={field.value} recommended={70} />
                    </span>
                  }
                />
              )}
            />
            <Controller
              name='sortOrder'
              control={control}
              render={({ field }) => (
                <NumberInput
                  {...field}
                  label='Sort order'
                  min={0}
                  step={1}
                  containerClassName='sm:max-w-48'
                  helperText='Lower numbers are listed first.'
                  error={errors.sortOrder?.message}
                />
              )}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title='Image' icon='tabler-photo' description='One image, required' />
          <CardBody>
            <ImageUpload
              type='category'
              value={image ? [image] : []}
              onChange={urls => setValue('image', urls[0] ?? '', { shouldValidate: true, shouldDirty: true })}
              onUploadingChange={setImageUploading}
              label='Category image'
              error={errors.image?.message}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title='SEO'
            icon='tabler-world-search'
            description='How this category appears in search results'
          />
          <CardBody>
            <SeoFieldsSection
              control={control}
              sourceValue={name}
              preview={{ title: `${name || 'Category'} · Al Madina Ittar`, description: tagline }}
              note="The website currently builds this page's search listing from the name and tagline; the meta fields are stored for other channels."
              bare
            />
          </CardBody>
        </Card>
      </FormLayout>

      <FormActions
        dirty={isDirty}
        submitting={submitting}
        submitLabel={isEdit ? 'Save changes' : 'Create category'}
        submitIcon={isEdit ? undefined : 'tabler-check'}
        onCancel={onCancel}
      />
    </form>
  )
}

/** A plain image-over-text tile — the category has no accent or card of its own. */
const CategoryPreview = ({
  name,
  tagline,
  image,
  productCount
}: {
  name: string
  tagline?: string
  image: string
  productCount?: number
}) => (
  <div className='overflow-hidden rounded-lg border border-border bg-backgroundPaper'>
    <div className='flex aspect-[4/3] items-center justify-center overflow-hidden bg-surfaceSunken/50'>
      {image ? (
        <img src={image} alt='' className='size-full object-cover' />
      ) : (
        <i aria-hidden className='tabler-photo text-3xl text-textMuted' />
      )}
    </div>
    <div className='flex flex-col gap-0.5 p-3.5'>
      <span className='truncate text-sm font-semibold text-textPrimary'>{name || 'Untitled category'}</span>
      <span className='line-clamp-2 text-xs text-textSecondary'>{tagline || 'No tagline'}</span>
      {productCount !== undefined && (
        <span className='mt-1.5 text-xs text-textMuted'>
          {productCount} {productCount === 1 ? 'product' : 'products'}
        </span>
      )}
    </div>
  </div>
)

export default CategoryForm
