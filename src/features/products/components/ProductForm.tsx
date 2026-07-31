'use client'

// Create/edit product form. RHF + Zod; gallery via shared ImageUpload
// (type=product). Category options come from the categories feature.
// Layout: 2-column multi-card grid (content left, pricing/organize/SEO
// right), adapted from Theme's ecommerce products/add page — same
// RHF/Zod fields, mutations, and SeoFieldsSection/ImageUpload as before,
// only regrouped into cards instead of one long column.
import { useEffect, useMemo, useState } from 'react'

import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Combobox from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switch from '@/components/ui/Switch'
import Textarea from '@/components/ui/Textarea'
import ImageUpload from '@/components/shared/ImageUpload'
import SeoFieldsSection from '@/components/shared/SeoFieldsSection'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useTags } from '@/features/tags/hooks/useTags'
import { productSchema, defaultProductValues, type ProductFormValues } from '../schema'
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts'
import { PRODUCT_BADGES, PRODUCT_VARIANT_SIZES_ML, SCENT_FAMILIES, type Product } from '../types'
import { humanize } from '@/libs/format'

type Props = {
  product?: Product | null
  onSuccess: (product: Product) => void
  onCancel: () => void
}

const AVAILABILITY_FLAGS: { name: keyof ProductFormValues; label: string }[] = [{ name: 'inStock', label: 'In stock' }]

const MERCHANDISING_FLAGS: { name: keyof ProductFormValues; label: string }[] = [
  { name: 'isFeatured', label: 'Featured' },
  { name: 'isNewArrival', label: 'New arrival' },
  { name: 'isBestSeller', label: 'Best seller' },
  { name: 'isSignature', label: 'Signature' },
  { name: 'isSeasonal', label: 'Seasonal' }
]

const ProductForm = ({ product, onSuccess, onCancel }: Props) => {
  const { success, error } = useToast()
  const { data: categories } = useCategories()
  const { data: tags } = useTags()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const [imagesUploading, setImagesUploading] = useState(false)
  const isEdit = !!product

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultProductValues
  })

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant
  } = useFieldArray({
    control,
    name: 'variants'
  })

  useEffect(() => {
    reset(
      product
        ? {
            name: product.name,
            nameAr: product.nameAr ?? '',
            brand: product.brand,
            categoryId: product.categoryId,
            description: product.description,
            scentFamily: product.scentFamily,
            volumeMl: product.volumeMl,
            price: product.price,
            originalPrice: product.originalPrice,
            currency: product.currency,
            notes: product.notes ?? [],
            images: product.images ?? [],
            badge: product.badge,
            inStock: product.inStock,
            isFeatured: product.isFeatured,
            isNewArrival: product.isNewArrival,
            isBestSeller: product.isBestSeller,
            isSignature: product.isSignature,
            isSeasonal: product.isSeasonal,
            variants: product.variants ?? [],
            tagIds: product.tagIds ?? [],
            slug: product.slug ?? '',
            metaTitle: product.metaTitle ?? '',
            metaDescription: product.metaDescription ?? '',
            metaKeywords: product.metaKeywords ?? []
          }
        : defaultProductValues
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  const images = watch('images')
  const notes = watch('notes')
  const tagIds = watch('tagIds')
  const metaKeywords = watch('metaKeywords')

  const selectedTags = useMemo(() => (tags ?? []).filter(t => tagIds.includes(t.id)), [tags, tagIds])

  const onSubmit = async (values: ProductFormValues) => {
    // Drop empty optional fields so we don't send blank strings.
    const payload = {
      ...values,
      nameAr: values.nameAr || undefined,
      slug: values.slug || undefined,
      metaTitle: values.metaTitle || undefined,
      metaDescription: values.metaDescription || undefined
    }

    try {
      if (isEdit && product) {
        const updated = await updateMutation.mutateAsync({ id: product.id, body: payload })

        success('Product updated')
        onSuccess(updated)
      } else {
        const created = await createMutation.mutateAsync(payload)

        success('Product created')
        onSuccess(created)
      }
    } catch (err) {
      error(getErrorMessage(err, 'Something went wrong'))
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending || imagesUploading

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <div className='flex flex-col gap-6 md:col-span-2'>
          <Card>
            <CardHeader title='Product information' />
            <CardBody className='flex flex-col gap-5'>
              <Controller
                name='name'
                control={control}
                render={({ field }) => <Input {...field} required label='Name' error={errors.name?.message} />}
              />
              <Controller
                name='nameAr'
                control={control}
                render={({ field }) => <Input {...field} label='Arabic name (optional)' dir='rtl' />}
              />
              <Controller
                name='brand'
                control={control}
                render={({ field }) => <Input {...field} required label='Brand' error={errors.brand?.message} />}
              />
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <Textarea {...field} required rows={3} label='Description' error={errors.description?.message} />
                )}
              />
              <Controller
                name='notes'
                control={control}
                render={({ field }) => (
                  <Combobox
                    freeSolo
                    label='Fragrance notes'
                    placeholder='Type a note and press Enter'
                    options={[]}
                    value={notes ?? []}
                    onChange={next => field.onChange(next)}
                  />
                )}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title='Gallery' />
            <CardBody>
              <ImageUpload
                type='product'
                multiple
                value={images ?? []}
                onChange={urls => setValue('images', urls)}
                onUploadingChange={setImagesUploading}
                label='Gallery images'
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title='Variants'
              description='Sizes this fragrance is sold in'
              action={
                <Button
                  type='button'
                  size='sm'
                  variant='soft'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() =>
                    appendVariant({ volumeMl: 50, price: 0, sku: '', barcode: '', stock: 0, inStock: true })
                  }
                >
                  Add size
                </Button>
              }
            />
            <CardBody className='flex flex-col gap-3'>
              {variantFields.length === 0 && (
                <p className='text-xs text-textSecondary'>
                  No additional bottle sizes — the product sells at the base volume/price above.
                </p>
              )}
              {variantFields.map((variantField, index) => (
                <div key={variantField.id} className='flex flex-wrap items-end gap-3'>
                  <Controller
                    name={`variants.${index}.volumeMl`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        containerClassName='min-w-[100px] flex-1'
                        label='Size'
                        onChange={e => field.onChange(Number(e.target.value))}
                        options={PRODUCT_VARIANT_SIZES_ML.map(size => ({ label: `${size}ml`, value: size }))}
                      />
                    )}
                  />
                  <Controller
                    name={`variants.${index}.price`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        containerClassName='min-w-[100px] flex-1'
                        onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                        type='number'
                        label='Price'
                        error={errors.variants?.[index]?.price ? ' ' : undefined}
                      />
                    )}
                  />
                  <Controller
                    name={`variants.${index}.sku`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        containerClassName='min-w-[100px] flex-1'
                        label='SKU'
                        error={errors.variants?.[index]?.sku ? ' ' : undefined}
                      />
                    )}
                  />
                  <Controller
                    name={`variants.${index}.stock`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        containerClassName='min-w-[80px] flex-1'
                        onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                        type='number'
                        label='Stock'
                      />
                    )}
                  />
                  <IconButton
                    size='sm'
                    color='error'
                    aria-label='Remove size'
                    onClick={() => removeVariant(index)}
                    className='mb-1'
                  >
                    <i className='tabler-trash' />
                  </IconButton>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        <div className='flex flex-col gap-6'>
          <Card>
            <CardHeader title='Pricing' />
            <CardBody className='flex flex-col gap-5'>
              <Controller
                name='volumeMl'
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    required
                    label='Volume (ml)'
                    error={errors.volumeMl?.message}
                    options={PRODUCT_VARIANT_SIZES_ML.map(size => ({ label: `${size}ml`, value: size }))}
                  />
                )}
              />
              <Controller
                name='currency'
                control={control}
                render={({ field }) => <Input {...field} label='Currency' />}
              />
              <Controller
                name='price'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                    type='number'
                    required
                    label='Price'
                    error={errors.price?.message}
                  />
                )}
              />
              <Controller
                name='originalPrice'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                    type='number'
                    label='Original price (optional)'
                  />
                )}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title='Organize' />
            <CardBody className='flex flex-col gap-5'>
              <Controller
                name='categoryId'
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    required
                    label='Category'
                    error={errors.categoryId?.message}
                    options={(categories ?? []).map(category => ({ label: category.name, value: category.id }))}
                  />
                )}
              />
              <Controller
                name='scentFamily'
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    required
                    label='Scent family'
                    options={SCENT_FAMILIES.map(family => ({ label: humanize(family), value: family }))}
                  />
                )}
              />
              <Controller
                name='badge'
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value ?? ''}
                    label='Badge (optional)'
                    options={[
                      { label: 'None', value: '' },
                      ...PRODUCT_BADGES.map(badge => ({ label: humanize(badge), value: badge }))
                    ]}
                  />
                )}
              />
              <Combobox
                label='Tags'
                placeholder='Select tags'
                options={tags ?? []}
                value={selectedTags}
                getOptionLabel={t => t.name}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                onChange={next =>
                  setValue(
                    'tagIds',
                    next.map(t => t.id)
                  )
                }
              />

              <hr className='border-border' />
              <span className='text-xs font-semibold uppercase tracking-widest text-textSecondary'>Availability</span>
              <div className='flex flex-wrap gap-x-6 gap-y-2'>
                {AVAILABILITY_FLAGS.map(flag => (
                  <Controller
                    key={flag.name}
                    name={flag.name}
                    control={control}
                    render={({ field }) => (
                      <Switch
                        label={flag.label}
                        checked={!!field.value}
                        onChange={e => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                ))}
              </div>
              <span className='text-xs font-semibold uppercase tracking-widest text-textSecondary'>
                Merchandising &amp; rails
              </span>
              <div className='flex flex-wrap gap-x-6 gap-y-2'>
                {MERCHANDISING_FLAGS.map(flag => (
                  <Controller
                    key={flag.name}
                    name={flag.name}
                    control={control}
                    render={({ field }) => (
                      <Switch
                        label={flag.label}
                        checked={!!field.value}
                        onChange={e => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title='SEO' />
            <CardBody>
              <SeoFieldsSection control={control} metaKeywords={metaKeywords ?? []} bare />
            </CardBody>
          </Card>
        </div>

        <div className='md:col-span-3'>
          <div className='flex items-center justify-end gap-4'>
            <Button type='button' variant='outlined' color='secondary' onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type='submit' loading={submitting}>
              {isEdit ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default ProductForm
