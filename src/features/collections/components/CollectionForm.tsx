'use client'

// Create/edit collection form (doc §5.4). RHF + Zod. Main column: details,
// appearance (image, accent, order), SEO; aside: a live card preview.
import { useState } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Input from '@/components/ui/form/Input'
import NumberInput from '@/components/ui/form/NumberInput'
import ChoiceChips from '@/components/ui/form/ChoiceChips'
import FormActions from '@/components/shared/FormActions'
import ImageUpload from '@/components/shared/ImageUpload'
import SeoFieldsSection from '@/components/shared/SeoFieldsSection'
import CharCount from '@/components/shared/CharCount'
import FormLayout from '@/components/shared/FormLayout'
import { useInvalidSubmit } from '@/hooks/useInvalidSubmit'
import { useFormSync } from '@/hooks/useFormSync'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { humanize } from '@/libs/format'
import { collectionSchema, defaultCollectionValues, type CollectionFormValues } from '../schema'
import { useCreateCollection, useUpdateCollection } from '../hooks/useCollections'
import { COLLECTION_ACCENTS, type Collection } from '../types'
import { accentSwatch } from '../accent'
import CollectionCard from './CollectionCard'

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

  const [title, subtitle, image, accent, sortOrder] = watch(['title', 'subtitle', 'image', 'accent', 'sortOrder'])
  const onInvalid = useInvalidSubmit<CollectionFormValues>()

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
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
      <FormLayout
        stickyAside
        aside={
          <Card>
            <CardHeader
              title='Preview'
              icon='tabler-eye'
              description='How the collection card reads in the admin grid'
            />
            <CardBody>
              <CollectionCard
                title={title}
                subtitle={subtitle}
                image={image}
                accent={accent}
                productCount={collection?.productCount ?? 0}
                sortOrder={sortOrder}
              />
            </CardBody>
          </Card>
        }
      >
        <Card>
          <CardHeader
            title='Details'
            icon='tabler-info-circle'
            description='What customers see on the collection card'
          />
          <CardBody className='flex flex-col gap-5'>
            <Controller
              name='title'
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  required
                  label='Title'
                  placeholder='e.g. The Oud Edit'
                  error={errors.title?.message}
                  helperText={<CharCount value={field.value} recommended={40} />}
                />
              )}
            />
            <Controller
              name='subtitle'
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  required
                  label='Subtitle'
                  placeholder='One line on what ties these fragrances together'
                  error={errors.subtitle?.message}
                  helperText={<CharCount value={field.value} recommended={70} />}
                />
              )}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title='Appearance' icon='tabler-palette' description='Cover image and accent colour' />
          <CardBody className='flex flex-col gap-6'>
            <ImageUpload
              type='collection'
              value={image ? [image] : []}
              onChange={urls => setValue('image', urls[0] ?? '', { shouldValidate: true, shouldDirty: true })}
              onUploadingChange={setImageUploading}
              label='Cover image'
              error={errors.image?.message}
            />
            <Controller
              name='accent'
              control={control}
              render={({ field }) => (
                <ChoiceChips
                  label='Accent'
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.accent?.message}
                  helperText='Tints the collection card in the app.'
                  options={COLLECTION_ACCENTS.map(a => ({ value: a, label: humanize(a), swatch: accentSwatch[a] }))}
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
          <CardHeader
            title='SEO'
            icon='tabler-world-search'
            description='How this collection appears in search results'
          />
          <CardBody>
            <SeoFieldsSection
              control={control}
              sourceValue={title}
              sourceFieldLabel='title'
              preview={{ title: `${title || 'Collection'} · Al Madina Ittar`, description: subtitle }}
              note="The website currently builds this page's search listing from the title and subtitle; the meta fields are stored for other channels."
              bare
            />
          </CardBody>
        </Card>
      </FormLayout>

      <FormActions
        dirty={isDirty}
        submitting={submitting}
        submitLabel={isEdit ? 'Save changes' : 'Create collection'}
        submitIcon={isEdit ? undefined : 'tabler-check'}
        onCancel={onCancel}
      />
    </form>
  )
}

export default CollectionForm
