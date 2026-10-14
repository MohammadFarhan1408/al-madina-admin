'use client'

// Create/edit product form. RHF + Zod; gallery via shared ImageUpload
// (type=product). Main column follows how a product is described: basics,
// fragrance, gallery, sizes & pricing, SEO. The aside holds the switches and
// short choices an admin flips most: availability, badge, storefront rails,
// tags.
import { useMemo, useState } from 'react'

import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Combobox from '@/components/ui/form/Combobox'
import Input from '@/components/ui/form/Input'
import NumberInput from '@/components/ui/form/NumberInput'
import Select from '@/components/ui/form/Select'
import Switch from '@/components/ui/form/Switch'
import Textarea from '@/components/ui/form/Textarea'
import ChoiceChips from '@/components/ui/form/ChoiceChips'
import FormActions from '@/components/shared/FormActions'
import FormLayout from '@/components/shared/FormLayout'
import { useInvalidSubmit } from '@/hooks/useInvalidSubmit'
import ImageUpload from '@/components/shared/ImageUpload'
import SeoFieldsSection from '@/components/shared/SeoFieldsSection'
import { useFormSync } from '@/hooks/useFormSync'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useTags } from '@/features/tags/hooks/useTags'
import { productSchema, defaultProductValues, type ProductFormValues } from '../schema'
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts'
import {
  PRODUCT_BADGES,
  PRODUCT_VARIANT_SIZES_ML,
  SCENT_FAMILIES,
  type Product,
  type ProductBadge,
  type ProductVariantSizeMl,
  type ScentFamily
} from '../types'
import { humanize } from '@/libs/format'

type Props = {
  product?: Product | null
  onSuccess: (product: Product) => void
  onCancel: () => void
}

// Each flag puts the product in one of the app's home-screen rails
// (products.service RAIL_FLAGS).
const MERCHANDISING_FLAGS: {
  name: 'isFeatured' | 'isNewArrival' | 'isBestSeller' | 'isSignature' | 'isSeasonal'
  label: string
  description: string
}[] = [
  { name: 'isFeatured', label: 'Featured', description: 'Featured rail' },
  { name: 'isNewArrival', label: 'New arrival', description: 'New arrivals rail' },
  { name: 'isBestSeller', label: 'Best seller', description: 'Best sellers rail' },
  { name: 'isSignature', label: 'Signature', description: 'Signature rail' },
  { name: 'isSeasonal', label: 'Seasonal', description: 'Seasonal rail' }
]

const SIZE_OPTIONS = PRODUCT_VARIANT_SIZES_ML.map(size => ({ value: size, label: `${size}ml` }))

// Hides a field's own label from `md` up, where the variants grid has a
// single header row instead (it stays for screen readers, and on phones,
// where each variant stacks as a little form of its own).
const gridLabel = 'md:[&>:first-child]:sr-only'

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
    formState: { errors, isDirty }
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

  useFormSync(
    reset,
    product,
    p => ({
      name: p.name,
      nameAr: p.nameAr ?? '',
      brand: p.brand,
      categoryId: p.categoryId,
      description: p.description,
      scentFamily: p.scentFamily,
      volumeMl: p.volumeMl,
      price: p.price,
      originalPrice: p.originalPrice,
      notes: p.notes ?? [],
      images: p.images ?? [],
      badge: p.badge,
      inStock: p.inStock,
      isFeatured: p.isFeatured,
      isNewArrival: p.isNewArrival,
      isBestSeller: p.isBestSeller,
      isSignature: p.isSignature,
      isSeasonal: p.isSeasonal,
      variants: p.variants ?? [],
      tagIds: p.tagIds ?? [],
      slug: p.slug ?? '',
      metaTitle: p.metaTitle ?? '',
      metaDescription: p.metaDescription ?? '',
      metaKeywords: p.metaKeywords ?? []
    }),
    defaultProductValues
  )

  const [images, notes, tagIds, name, description, metaDescription, price, originalPrice, volumeMl, variants] = watch([
    'images',
    'notes',
    'tagIds',
    'name',
    'description',
    'metaDescription',
    'price',
    'originalPrice',
    'volumeMl',
    'variants'
  ])

  const onInvalid = useInvalidSubmit<ProductFormValues>()

  const selectedTags = useMemo(() => (tags ?? []).filter(t => tagIds.includes(t.id)), [tags, tagIds])

  // Not blocking (the API accepts it), but almost always a mistake: a variant
  // repeating the default size makes that size's price ambiguous. Duplicate
  // variant sizes/SKUs are blocking — see productSchema.
  const sizeWarnings = useMemo(
    () =>
      (variants ?? []).map(v => (v.volumeMl === volumeMl ? `${v.volumeMl}ml is already the default size` : undefined)),
    [variants, volumeMl]
  )

  const discountPercent =
    originalPrice !== undefined && price !== undefined && originalPrice > price && originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined

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
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
      <FormLayout
        aside={
          <>
            <Card>
              <CardHeader title='Status' icon='tabler-toggle-right' />
              <CardBody className='flex flex-col gap-5'>
                <Controller
                  name='inStock'
                  control={control}
                  render={({ field }) => (
                    <Switch
                      reverse
                      label='In stock'
                      description='For the default size. Variants have their own switch.'
                      checked={!!field.value}
                      onChange={e => field.onChange(e.target.checked)}
                    />
                  )}
                />
                <Controller
                  name='badge'
                  control={control}
                  render={({ field }) => (
                    <ChoiceChips<ProductBadge | ''>
                      label='Badge'
                      value={field.value ?? ''}
                      onChange={v => field.onChange(v === '' ? undefined : v)}
                      helperText='Shown on the product image.'
                      options={[
                        { value: '', label: 'None' },
                        ...PRODUCT_BADGES.map(badge => ({ value: badge, label: humanize(badge) }))
                      ]}
                    />
                  )}
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title='Storefront rails'
                icon='tabler-layout-rows'
                description='Home-screen sections the product appears in'
              />
              <CardBody className='flex flex-col gap-1'>
                {MERCHANDISING_FLAGS.map(flag => (
                  <Controller
                    key={flag.name}
                    name={flag.name}
                    control={control}
                    render={({ field }) => (
                      <Switch
                        reverse
                        label={flag.label}
                        description={flag.description}
                        checked={!!field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        className='py-1.5'
                      />
                    )}
                  />
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title='Tags' icon='tabler-tags' />
              <CardBody>
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
                      next.map(t => t.id),
                      { shouldDirty: true }
                    )
                  }
                />
              </CardBody>
            </Card>
          </>
        }
      >
        <Card>
          <CardHeader
            title='Basics'
            icon='tabler-info-circle'
            description='Name, maker and where it lives in the catalogue'
          />
          <CardBody className='flex flex-col gap-5'>
            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
              <Controller
                name='name'
                control={control}
                render={({ field }) => (
                  <Input {...field} required label='Name' placeholder='e.g. Oud Supreme' error={errors.name?.message} />
                )}
              />
              <Controller
                name='nameAr'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    label='Arabic name'
                    dir='rtl'
                    lang='ar'
                    helperText='Optional.'
                  />
                )}
              />
              <Controller
                name='brand'
                control={control}
                render={({ field }) => <Input {...field} required label='Brand' error={errors.brand?.message} />}
              />
              <Controller
                name='categoryId'
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    required
                    label='Category'
                    placeholder='Choose a category'
                    error={errors.categoryId?.message}
                    options={(categories ?? []).map(category => ({ label: category.name, value: category.id }))}
                  />
                )}
              />
            </div>
            <Controller
              name='description'
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  required
                  rows={5}
                  label='Description'
                  placeholder='How it opens, how it settles, when to wear it'
                  error={errors.description?.message}
                  helperText={`${field.value?.length ?? 0} characters`}
                />
              )}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title='Fragrance'
            icon='tabler-droplet'
            description='Family and notes, used for browsing and search'
          />
          <CardBody className='flex flex-col gap-5'>
            <Controller
              name='scentFamily'
              control={control}
              render={({ field }) => (
                <ChoiceChips<ScentFamily>
                  label='Scent family'
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.scentFamily?.message}
                  options={SCENT_FAMILIES.map(family => ({ value: family, label: humanize(family) }))}
                />
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
                  helperText='In order: top, heart, then base notes.'
                  options={[]}
                  value={notes ?? []}
                  onChange={next => field.onChange(next)}
                />
              )}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title='Gallery'
            icon='tabler-photo'
            description={
              images?.length
                ? 'The first image is the cover in lists and cards'
                : 'Add photos — the first one becomes the cover'
            }
          />
          <CardBody>
            <ImageUpload
              type='product'
              multiple
              value={images ?? []}
              onChange={urls => setValue('images', urls, { shouldDirty: true })}
              onUploadingChange={setImagesUploading}
              label='Gallery images'
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title='Sizes & pricing'
            icon='tabler-cash'
            description='The default size, then any other bottle sizes'
          />
          <CardBody className='flex flex-col gap-6'>
            <section aria-labelledby='default-size' className='flex flex-col gap-4'>
              <h3 id='default-size' className='text-xs font-semibold tracking-[0.06em] text-textMuted uppercase'>
                Default size
              </h3>
              <Controller
                name='volumeMl'
                control={control}
                render={({ field }) => (
                  <ChoiceChips<ProductVariantSizeMl>
                    label='Volume'
                    required
                    value={field.value as ProductVariantSizeMl}
                    onChange={field.onChange}
                    error={errors.volumeMl?.message}
                    options={SIZE_OPTIONS}
                  />
                )}
              />
              <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
                <Controller
                  name='price'
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      required
                      min={0}
                      label='Price'
                      startAdornment={<span className='text-xs text-textMuted'>AED</span>}
                      error={errors.price?.message}
                    />
                  )}
                />
                <Controller
                  name='originalPrice'
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      min={0}
                      label='Original price'
                      startAdornment={<span className='text-xs text-textMuted'>AED</span>}
                      helperText={
                        discountPercent !== undefined
                          ? `Shown struck through — ${discountPercent}% off.`
                          : 'Optional. Set above the price to show a sale.'
                      }
                      error={errors.originalPrice?.message}
                    />
                  )}
                />
              </div>
            </section>

            <section aria-labelledby='variant-sizes' className='flex flex-col gap-3 border-t border-border pt-5'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <h3 id='variant-sizes' className='text-xs font-semibold tracking-[0.06em] text-textMuted uppercase'>
                  Other sizes{variantFields.length ? ` · ${variantFields.length}` : ''}
                </h3>
                <Button
                  type='button'
                  size='sm'
                  variant='soft'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => {
                    // Suggest the first size not already used, rather than always 50ml.
                    const used = new Set([volumeMl, ...(variants ?? []).map(v => v.volumeMl)])
                    const next = PRODUCT_VARIANT_SIZES_ML.find(size => !used.has(size)) ?? PRODUCT_VARIANT_SIZES_ML[0]

                    appendVariant({ volumeMl: next, price: 0, sku: '', barcode: '', stock: 0, inStock: true })
                  }}
                >
                  Add size
                </Button>
              </div>

              {variantFields.length === 0 ? (
                <p className='rounded-md border border-dashed border-border px-4 py-5 text-center text-sm text-textMuted'>
                  Sold in the default size only. Add a size to offer more bottles, each with its own price, SKU and
                  stock.
                </p>
              ) : (
                <div className='flex flex-col gap-3 md:gap-0'>
                  {/* Column headings, from md up */}
                  <div
                    aria-hidden
                    className='hidden grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,1.3fr)_5.5rem_5.5rem_2.25rem] gap-3 px-1 pb-1.5 text-xs font-medium text-textSecondary md:grid'
                  >
                    <span>Size</span>
                    <span>Price</span>
                    <span>SKU</span>
                    <span>Stock</span>
                    <span>In stock</span>
                    <span />
                  </div>
                  {variantFields.map((variantField, index) => (
                    <div
                      key={variantField.id}
                      className='flex flex-col gap-2 rounded-md border border-border p-3 md:rounded-none md:border-0 md:border-t md:px-1 md:py-2.5'
                    >
                      <div className='grid grid-cols-2 items-start gap-3 md:grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,1.3fr)_5.5rem_5.5rem_2.25rem]'>
                        <Controller
                          name={`variants.${index}.volumeMl`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              label='Size'
                              containerClassName={gridLabel}
                              error={errors.variants?.[index]?.volumeMl?.message}
                              onChange={e => field.onChange(Number(e.target.value))}
                              options={SIZE_OPTIONS}
                            />
                          )}
                        />
                        <Controller
                          name={`variants.${index}.price`}
                          control={control}
                          render={({ field }) => (
                            <NumberInput
                              {...field}
                              min={0}
                              label='Price'
                              containerClassName={gridLabel}
                              startAdornment={<span className='text-xs text-textMuted'>AED</span>}
                              error={errors.variants?.[index]?.price?.message}
                            />
                          )}
                        />
                        <Controller
                          name={`variants.${index}.sku`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              label='SKU'
                              placeholder='AM-…'
                              className='font-mono text-xs uppercase'
                              containerClassName={`col-span-2 md:col-span-1 ${gridLabel}`}
                              error={errors.variants?.[index]?.sku?.message}
                            />
                          )}
                        />
                        <Controller
                          name={`variants.${index}.stock`}
                          control={control}
                          render={({ field }) => (
                            <NumberInput
                              {...field}
                              min={0}
                              step={1}
                              label='Stock'
                              containerClassName={gridLabel}
                              error={errors.variants?.[index]?.stock?.message}
                            />
                          )}
                        />
                        <Controller
                          name={`variants.${index}.inStock`}
                          control={control}
                          render={({ field }) => (
                            <div className='flex h-full items-end md:h-10 md:items-center'>
                              <Switch
                                label={<span className='md:sr-only'>In stock</span>}
                                aria-label='In stock'
                                checked={field.value}
                                onChange={e => field.onChange(e.target.checked)}
                              />
                            </div>
                          )}
                        />
                        <div className='col-span-2 flex justify-end md:col-span-1 md:h-10 md:items-center'>
                          <IconButton
                            size='sm'
                            color='error'
                            aria-label={`Remove the ${variants?.[index]?.volumeMl ?? ''}ml size`}
                            title='Remove size'
                            onClick={() => removeVariant(index)}
                          >
                            <i className='tabler-trash' />
                          </IconButton>
                        </div>
                      </div>
                      {sizeWarnings[index] && (
                        <p className='flex items-center gap-1.5 text-xs text-warningInk'>
                          <i aria-hidden className='tabler-alert-triangle' />
                          {sizeWarnings[index]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title='SEO' icon='tabler-world-search' description='How this product appears in search results' />
          <CardBody>
            <SeoFieldsSection
              control={control}
              sourceValue={name}
              preview={{
                title: `${name || 'Product'} · Al Madina Ittar`,
                description: metaDescription || description
              }}
              note='The website titles this page with the product name and uses the meta description (or, if blank, the description) as its search snippet.'
              bare
            />
          </CardBody>
        </Card>
      </FormLayout>

      <FormActions
        dirty={isDirty}
        submitting={submitting}
        submitLabel={isEdit ? 'Save changes' : 'Create product'}
        submitIcon={isEdit ? undefined : 'tabler-check'}
        onCancel={onCancel}
      />
    </form>
  )
}

export default ProductForm
