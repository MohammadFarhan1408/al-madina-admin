'use client'

// Create/edit product form. RHF + Zod; gallery via shared ImageUpload
// (type=product). Category options come from the categories feature.
// Layout: 2-column multi-card grid (content left, pricing/organize/SEO
// right), adapted from Theme's ecommerce products/add page — same
// RHF/Zod fields, mutations, and SeoFieldsSection/ImageUpload as before,
// only regrouped into cards instead of one long column.
import { useEffect, useMemo, useState } from 'react'

import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import CustomTextField from '@core/components/mui/TextField'
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
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader title='Product information' />
                <CardContent className='flex flex-col gap-5'>
                  <Controller
                    name='name'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        required
                        label='Name'
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                  <Controller
                    name='nameAr'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth label='Arabic name (optional)' dir='rtl' />
                    )}
                  />
                  <Controller
                    name='brand'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        required
                        label='Brand'
                        error={!!errors.brand}
                        helperText={errors.brand?.message}
                      />
                    )}
                  />
                  <Controller
                    name='description'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        required
                        multiline
                        minRows={3}
                        label='Description'
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    )}
                  />
                  <Controller
                    name='notes'
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        multiple
                        freeSolo
                        options={[]}
                        value={notes ?? []}
                        onChange={(_, next) => field.onChange(next)}
                        renderTags={(tagValue, getTagProps) =>
                          tagValue.map((option, index) => {
                            const { key, ...rest } = getTagProps({ index })

                            return <Chip key={key} variant='tonal' label={option} size='small' {...rest} />
                          })
                        }
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Fragrance notes'
                            placeholder='Type a note and press Enter'
                          />
                        )}
                      />
                    )}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader title='Gallery' />
                <CardContent>
                  <ImageUpload
                    type='product'
                    multiple
                    value={images ?? []}
                    onChange={urls => setValue('images', urls)}
                    onUploadingChange={setImagesUploading}
                    label='Gallery images'
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader
                  title='Variants'
                  action={
                    <Button
                      size='small'
                      startIcon={<i className='tabler-plus' />}
                      onClick={() =>
                        appendVariant({ volumeMl: 50, price: 0, sku: '', barcode: '', stock: 0, inStock: true })
                      }
                    >
                      Add size
                    </Button>
                  }
                />
                <CardContent className='flex flex-col gap-3'>
                  {variantFields.length === 0 && (
                    <Typography variant='caption' color='text.secondary'>
                      No additional bottle sizes — the product sells at the base volume/price above.
                    </Typography>
                  )}
                  {variantFields.map((variantField, index) => (
                    <Grid container key={variantField.id} spacing={3} alignItems='center'>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Controller
                          name={`variants.${index}.volumeMl`}
                          control={control}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              select
                              fullWidth
                              label='Size'
                              onChange={e => field.onChange(Number(e.target.value))}
                            >
                              {PRODUCT_VARIANT_SIZES_ML.map(size => (
                                <MenuItem key={size} value={size}>
                                  {size}ml
                                </MenuItem>
                              ))}
                            </CustomTextField>
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Controller
                          name={`variants.${index}.price`}
                          control={control}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                              type='number'
                              fullWidth
                              label='Price'
                              error={!!errors.variants?.[index]?.price}
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Controller
                          name={`variants.${index}.sku`}
                          control={control}
                          render={({ field }) => (
                            <CustomTextField {...field} fullWidth label='SKU' error={!!errors.variants?.[index]?.sku} />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 5, sm: 2 }}>
                        <Controller
                          name={`variants.${index}.stock`}
                          control={control}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                              type='number'
                              fullWidth
                              label='Stock'
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 1 }}>
                        <IconButton
                          size='small'
                          color='error'
                          aria-label='Remove size'
                          onClick={() => removeVariant(index)}
                        >
                          <i className='tabler-trash' />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader title='Pricing' />
                <CardContent className='flex flex-col gap-5'>
                  <Controller
                    name='volumeMl'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        select
                        onChange={e => field.onChange(Number(e.target.value))}
                        fullWidth
                        required
                        label='Volume (ml)'
                        error={!!errors.volumeMl}
                        helperText={errors.volumeMl?.message}
                      >
                        {PRODUCT_VARIANT_SIZES_ML.map(size => (
                          <MenuItem key={size} value={size}>
                            {size}ml
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    )}
                  />
                  <Controller
                    name='currency'
                    control={control}
                    render={({ field }) => <CustomTextField {...field} fullWidth label='Currency' />}
                  />
                  <Controller
                    name='price'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                        type='number'
                        fullWidth
                        required
                        label='Price'
                        error={!!errors.price}
                        helperText={errors.price?.message}
                      />
                    )}
                  />
                  <Controller
                    name='originalPrice'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        type='number'
                        fullWidth
                        label='Original price (optional)'
                      />
                    )}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader title='Organize' />
                <CardContent className='flex flex-col gap-5'>
                  <Controller
                    name='categoryId'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        select
                        fullWidth
                        required
                        label='Category'
                        error={!!errors.categoryId}
                        helperText={errors.categoryId?.message}
                      >
                        {(categories ?? []).map(category => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    )}
                  />
                  <Controller
                    name='scentFamily'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} select fullWidth required label='Scent family'>
                        {SCENT_FAMILIES.map(family => (
                          <MenuItem key={family} value={family}>
                            {humanize(family)}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    )}
                  />
                  <Controller
                    name='badge'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} value={field.value ?? ''} select fullWidth label='Badge (optional)'>
                        <MenuItem value=''>None</MenuItem>
                        {PRODUCT_BADGES.map(badge => (
                          <MenuItem key={badge} value={badge}>
                            {humanize(badge)}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    )}
                  />
                  <Autocomplete
                    multiple
                    options={tags ?? []}
                    value={selectedTags}
                    getOptionLabel={t => t.name}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    onChange={(_, next) =>
                      setValue(
                        'tagIds',
                        next.map(t => t.id)
                      )
                    }
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => {
                        const { key, ...rest } = getTagProps({ index })

                        return <Chip key={key} variant='tonal' label={option.name} size='small' {...rest} />
                      })
                    }
                    renderInput={params => <CustomTextField {...params} label='Tags' placeholder='Select tags' />}
                  />

                  <Divider />
                  <Typography variant='overline' color='text.secondary'>
                    Availability
                  </Typography>
                  <div className='flex flex-wrap gap-x-6 gap-y-2'>
                    {AVAILABILITY_FLAGS.map(flag => (
                      <Controller
                        key={flag.name}
                        name={flag.name}
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Switch checked={!!field.value} onChange={e => field.onChange(e.target.checked)} />
                            }
                            label={flag.label}
                          />
                        )}
                      />
                    ))}
                  </div>
                  <Typography variant='overline' color='text.secondary'>
                    Merchandising &amp; rails
                  </Typography>
                  <div className='flex flex-wrap gap-x-6 gap-y-2'>
                    {MERCHANDISING_FLAGS.map(flag => (
                      <Controller
                        key={flag.name}
                        name={flag.name}
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Switch checked={!!field.value} onChange={e => field.onChange(e.target.checked)} />
                            }
                            label={flag.label}
                          />
                        )}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader title='SEO' />
                <CardContent>
                  <SeoFieldsSection control={control} metaKeywords={metaKeywords ?? []} bare />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <div className='flex items-center justify-end gap-4'>
            <Button variant='tonal' color='secondary' onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type='submit' variant='contained' disabled={submitting}>
              {submitting ? <CircularProgress size={20} color='inherit' /> : isEdit ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </Grid>
      </Grid>
    </form>
  )
}

export default ProductForm
