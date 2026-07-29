'use client'

// Create/edit category form. RHF + Zod, image via shared ImageUpload. Hosted
// directly by the /categories/new and /categories/[id]/edit pages — no
// Dialog chrome, that's the page shell's job now.
import { useEffect, useState } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Card, { CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ImageUpload from '@/components/shared/ImageUpload'
import SeoFieldsSection from '@/components/shared/SeoFieldsSection'
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
    formState: { errors }
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultCategoryValues
  })

  useEffect(() => {
    reset(
      category
        ? {
            name: category.name,
            tagline: category.tagline ?? '',
            image: category.image,
            sortOrder: category.sortOrder,
            slug: category.slug ?? '',
            metaTitle: category.metaTitle ?? '',
            metaDescription: category.metaDescription ?? '',
            metaKeywords: category.metaKeywords ?? []
          }
        : defaultCategoryValues
    )
  }, [category, reset])

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
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
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
            onChange={urls => setValue('image', urls[0] ?? '', { shouldValidate: true })}
            onUploadingChange={setImageUploading}
            label='Category image'
            error={errors.image?.message}
          />

          <SeoFieldsSection control={control} metaKeywords={metaKeywords} />

          <div className='flex items-center justify-end gap-4'>
            <Button type='button' variant='outlined' color='secondary' onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type='submit' loading={submitting}>
              {isEdit ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}

export default CategoryForm
