'use client'

// Create/edit category form. RHF + Zod, image via shared ImageUpload. Hosted
// directly by the /categories/new and /categories/[id]/edit pages — no
// Dialog chrome, that's the page shell's job now.
import { useState } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Card, { CardBody } from '@/components/ui/Card'
import Input from '@/components/ui/form/Input'
import FormActions from '@/components/shared/FormActions'
import ImageUpload from '@/components/shared/ImageUpload'
import SeoFieldsSection from '@/components/shared/SeoFieldsSection'
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

  const image = watch('image')
  const metaKeywords = watch('metaKeywords')

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardBody className='flex flex-col gap-5'>
          <Controller
            name='name'
            control={control}
            render={({ field }) => <Input {...field} required label='Name' error={errors.name?.message} />}
          />
          <Controller name='tagline' control={control} render={({ field }) => <Input {...field} label='Tagline' />} />
          <Controller
            name='sortOrder'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                type='number'
                label='Sort order'
                error={errors.sortOrder?.message}
              />
            )}
          />
          <ImageUpload
            type='category'
            value={image ? [image] : []}
            onChange={urls => setValue('image', urls[0] ?? '', { shouldValidate: true, shouldDirty: true })}
            onUploadingChange={setImageUploading}
            label='Category image'
            error={errors.image?.message}
          />

          <SeoFieldsSection control={control} metaKeywords={metaKeywords} />
        </CardBody>
      </Card>

      <FormActions
        dirty={isDirty}
        submitting={submitting}
        submitLabel={isEdit ? 'Save changes' : 'Create'}
        onCancel={onCancel}
      />
    </form>
  )
}

export default CategoryForm
