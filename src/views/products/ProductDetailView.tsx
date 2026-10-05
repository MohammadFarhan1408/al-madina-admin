'use client'

// Read-only product detail — gallery, pricing, variants, tags, merchandising flags, SEO.
import { useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DetailSection from '@/components/shared/DetailSection'
import DetailRow from '@/components/shared/DetailRow'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import ZoomableImage from '@/components/shared/ZoomableImage'
import StatusChip from '@/components/shared/StatusChip'
import QueryState from '@/components/shared/QueryState'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { formatCurrency, humanize } from '@/libs/format'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useTags } from '@/features/tags/hooks/useTags'
import { useProduct, useDeleteProduct } from '@/features/products/hooks/useProducts'

type Props = { id: string }

const MERCHANDISING_FLAGS: {
  key: 'isFeatured' | 'isNewArrival' | 'isBestSeller' | 'isSignature' | 'isSeasonal'
  label: string
}[] = [
  { key: 'isFeatured', label: 'Featured' },
  { key: 'isNewArrival', label: 'New arrival' },
  { key: 'isBestSeller', label: 'Best seller' },
  { key: 'isSignature', label: 'Signature' },
  { key: 'isSeasonal', label: 'Seasonal' }
]

const ProductDetailView = ({ id }: Props) => {
  const router = useRouter()
  const { data: product, isLoading, isError, error, refetch } = useProduct(id)
  const { data: categories } = useCategories()
  const { data: tags } = useTags()
  const deleteMutation = useDeleteProduct()
  const { success, error: toastError } = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const categoryName = useMemo(
    () => (categories ?? []).find(c => c.id === product?.categoryId)?.name ?? '—',
    [categories, product]
  )

  const productTags = useMemo(() => (tags ?? []).filter(t => product?.tagIds.includes(t.id)), [tags, product])

  const handleDelete = async () => {
    if (!product) return

    try {
      await deleteMutation.mutateAsync(product.id)
      success('Product deleted')
      router.push('/products')
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to delete product'))
      setConfirmDelete(false)
    }
  }

  if (isLoading || !product) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Product' />
        <QueryState isError={isError} error={error} onRetry={() => refetch()} fallbackMessage='Failed to load product.' />
      </>
    )
  }

  const activeMerchandisingFlags = MERCHANDISING_FLAGS.filter(flag => product[flag.key])

  return (
    <>
      <Breadcrumbs extra={[{ label: product.name }]} />
      <PageHeader
        title={product.name}
        subtitle={`${product.brand} · ${humanize(product.scentFamily)}`}
        action={
          <div className='flex items-center gap-3'>
            <Button variant='outlined' color='secondary' onClick={() => router.push('/products')}>
              Back
            </Button>
            <Button
              variant='outlined'
              startIcon={<i className='tabler-edit' />}
              onClick={() => router.push(`/products/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant='outlined'
              color='error'
              startIcon={<i className='tabler-trash' />}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          </div>
        }
      />

      <div className='flex flex-col gap-4'>
        <DetailSection title='Gallery'>
          <div className='flex flex-wrap gap-3'>
            {product.images?.length ? (
              product.images.map((src, index) => (
                <ZoomableImage key={src + index} src={src} alt={product.name}>
                  <img src={src} alt='' className='size-24 rounded-md object-cover' />
                </ZoomableImage>
              ))
            ) : (
              <p className='text-sm text-textSecondary'>No gallery images.</p>
            )}
          </div>
        </DetailSection>

        <DetailSection title='Overview'>
          <DetailRow label='Category' value={categoryName} />
          <DetailRow label='Brand' value={product.brand} />
          <DetailRow label='Description' value={product.description} stacked />
          {product.nameAr && <DetailRow label='Arabic name' value={product.nameAr} />}
          <DetailRow label='Fragrance notes' value={product.notes.length ? product.notes.join(', ') : '—'} stacked />
        </DetailSection>

        <DetailSection title='Pricing'>
          <DetailRow label='Volume' value={`${product.volumeMl}ml`} />
          <DetailRow label='Price' value={formatCurrency(product.price, product.currency)} />
          {product.originalPrice != null && (
            <DetailRow label='Original price' value={formatCurrency(product.originalPrice, product.currency)} />
          )}
          <DetailRow label='Stock' value={<StatusChip value={product.inStock ? 'in-stock' : 'out-of-stock'} />} />
          <DetailRow label='Badge' value={product.badge ? <StatusChip value={product.badge} /> : '—'} />
        </DetailSection>

        {product.variants.length > 0 && (
          <DetailSection title='Variants'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Size</TableHeaderCell>
                  <TableHeaderCell>Price</TableHeaderCell>
                  <TableHeaderCell>SKU</TableHeaderCell>
                  <TableHeaderCell align='right'>Stock</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {product.variants.map((variant, index) => (
                  <TableRow key={variant.sku || index}>
                    <TableCell>{variant.volumeMl}ml</TableCell>
                    <TableCell>{formatCurrency(variant.price, product.currency)}</TableCell>
                    <TableCell>{variant.sku || '—'}</TableCell>
                    <TableCell align='right'>{variant.stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DetailSection>
        )}

        <DetailSection title='Tags & merchandising'>
          <DetailRow
            label='Tags'
            stacked
            value={
              productTags.length ? (
                <div className='flex flex-wrap gap-2'>
                  {productTags.map(tag => (
                    <Badge key={tag.id} color='secondary'>
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                '—'
              )
            }
          />
          <DetailRow
            label='Merchandising'
            stacked
            value={
              activeMerchandisingFlags.length ? (
                <div className='flex flex-wrap gap-2'>
                  {activeMerchandisingFlags.map(flag => (
                    <Badge key={flag.key} color='primary'>
                      {flag.label}
                    </Badge>
                  ))}
                </div>
              ) : (
                '—'
              )
            }
          />
        </DetailSection>

        {(product.slug || product.metaTitle || product.metaDescription || product.metaKeywords?.length) && (
          <DetailSection title='SEO'>
            <DetailRow label='Slug' value={product.slug || '—'} />
            <DetailRow label='Meta title' value={product.metaTitle || '—'} />
            <DetailRow label='Meta description' value={product.metaDescription || '—'} stacked />
            <DetailRow
              label='Meta keywords'
              value={product.metaKeywords?.length ? product.metaKeywords.join(', ') : '—'}
              stacked
            />
          </DetailSection>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title='Delete product'
        description={`Delete "${product.name}"? This performs a soft delete — it can be restored from the database if needed.`}
        confirmText='Delete'
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  )
}

export default ProductDetailView
