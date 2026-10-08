'use client'

// Create/edit collection form (doc §5.4). RHF + Zod; accent enum + image.
import { useState } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Card, { CardBody } from '@/components/ui/Card'
import Input from '@/components/ui/form/Input'
import NumberInput from '@/components/ui/form/NumberInput'
import Select from '@/components/ui/form/Select'
import FormActions from '@/components/shared/FormActions'
import ImageUpload from '@/components/shared/ImageUpload'
import SeoFieldsSection from '@/components/shared/SeoFieldsSection'
import { useFormSync } from '@/hooks/useFormSync'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { humanize } from '@/libs/format'
import { collectionSchema, defaultCollectionValues, type CollectionFormValues } from '../schema'
import { useCreateCollection, useUpdateCollection } from '../hooks/useCollections'
import { COLLECTION_ACCENTS, type Collection } from '../types'

type Props = {
  collection?: Collection | null
  onSuccess: (collection: Collection) => void
  onCancel: () => void
}

const CollectionForm = ({ collection, onSuccess, onCancel }: Props) => {
  const { success, error } = useToast()
  const createMutation = useCreateCollection()
  const updateMutation = useUpdateCollection()
  const [imageUploading, setImageUploading] = useState(false)
  const isEdit = !!collection

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: defaultCollectionValues
  })

  useFormSync(
    reset,
    collection,
    c => ({
      title: c.title,
      subtitle: c.subtitle,
      image: c.image,
      accent: c.accent,
      sortOrder: c.sortOrder,
      slug: c.slug ?? '',
      metaTitle: c.metaTitle ?? '',
      metaDescription: c.metaDescription ?? '',
      metaKeywords: c.metaKeywords ?? []
    }),
    defaultCollectionValues
  )

  const image = watch('image')
  const metaKeywords = watch('metaKeywords')

  const onSubmit = async (values: CollectionFormValues) => {
    const payload = {
      ...values,
      slug: values.slug || undefined,
      metaTitle: values.metaTitle || undefined,
      metaDescription: values.metaDescription || undefined
    }

    try {
      if (isEdit && collection) {
        const updated = await updateMutation.mutateAsync({ id: collection.id, body: payload })

        success('Collection updated')
        onSuccess(updated)
      } else {
        const created = await createMutation.mutateAsync(payload)

        success('Collection created')
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
            name='title'
            control={control}
            render={({ field }) => <Input {...field} required label='Title' error={errors.title?.message} />}
          />
          <Controller
            name='subtitle'
            control={control}
            render={({ field }) => <Input {...field} required label='Subtitle' error={errors.subtitle?.message} />}
          />
          <Controller
            name='accent'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label='Accent'
                options={COLLECTION_ACCENTS.map(accent => ({ label: humanize(accent), value: accent }))}
              />
            )}
          />
          <Controller
            name='sortOrder'
            control={control}
            render={({ field }) => <NumberInput {...field} label='Sort order' error={errors.sortOrder?.message} />}
          />
          <ImageUpload
            type='collection'
            value={image ? [image] : []}
            onChange={urls => setValue('image', urls[0] ?? '', { shouldValidate: true, shouldDirty: true })}
            onUploadingChange={setImageUploading}
            label='Collection image'
            error={errors.image?.message}
          />

          <hr className='border-border' />
          <SeoFieldsSection control={control} metaKeywords={metaKeywords ?? []} sourceFieldLabel='title' />
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

export default CollectionForm
