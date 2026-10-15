'use client'

// Product detail (read-only). Layout, top to bottom:
//   header — name, brand · category, record ID/dates, Back/Delete/Edit
//   hero   — gallery (left) | price, availability, description, notes (right)
//   metrics — price range, variants, units, images
//   details — Pricing & inventory table (wide) | tags, storefront placement, SEO
import { useMemo } from 'react'

import { useRouter } from 'next/navigation'

import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DetailActions from '@/components/shared/DetailActions'
import DetailLoading, { DetailHeroSkeleton } from '@/components/shared/DetailLoading'
import ImageGallery from '@/components/shared/ImageGallery'
import PageHeader from '@/components/shared/PageHeader'
import RecordMeta from '@/components/shared/RecordMeta'
import SeoCard from '@/components/shared/SeoCard'
import Card, { CardBody } from '@/components/ui/Card'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { humanize } from '@/libs/format'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useTags } from '@/features/tags/hooks/useTags'
import { useProduct, useDeleteProduct } from '@/features/products/hooks/useProducts'
import ProductInventoryTable from '@/features/products/components/detail/ProductInventoryTable'
import ProductMerchandising from '@/features/products/components/detail/ProductMerchandising'
import ProductMetrics from '@/features/products/components/detail/ProductMetrics'
import ProductSummary from '@/features/products/components/detail/ProductSummary'
import type { Product } from '@/features/products/types'

const ProductDetailView = ({ id }: { id: string }) => {
  const router = useRouter()
  const { data: product, isLoading, isError, error, refetch } = useProduct(id)
  const { data: categories } = useCategories()
  const { data: tags } = useTags()
  const deleteMutation = useDeleteProduct()

  const { ask, dialog } = useConfirmDelete<Product>({
    entity: 'product',
    remove: p => deleteMutation.mutateAsync(p.id),
    name: p => p.name,
    onDeleted: () => router.push('/products')
  })

  const categoryName = useMemo(
    () => (categories ?? []).find(c => c.id === product?.categoryId)?.name,
    [categories, product]
  )

  const productTags = useMemo(() => (tags ?? []).filter(t => product?.tagIds.includes(t.id)), [tags, product])

  if (isLoading || !product) {
    return (
      <DetailLoading
        title='Product'
        backHref='/products'
        backLabel='Back to products'
        skeleton={<DetailHeroSkeleton aspect='square' />}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        fallbackMessage='Failed to load product.'
      />
    )
  }

  return (
    <>
      <Breadcrumbs extra={[{ label: product.name }]} />
      <PageHeader
        backHref='/products'
        backLabel='Back to products'
        title={product.name}
        subtitle={[product.brand, categoryName ?? humanize(product.scentFamily)].filter(Boolean).join(' · ')}
        action={
          <DetailActions editHref={`/products/${id}/edit`} editLabel='Edit product' onDelete={() => ask(product)} />
        }
      >
        <RecordMeta id={product.id} idLabel='Product ID' createdAt={product.createdAt} updatedAt={product.updatedAt} />
      </PageHeader>

      <div className='flex flex-col gap-5'>
        {/* Hero — the product as a customer would meet it */}
        <Card>
          <CardBody padding='lg' className='grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]'>
            <ImageGallery
              images={product.images ?? []}
              name={product.name}
              emptyHint='Add images from Edit to show this product in the store.'
            />
            <ProductSummary product={product} categoryName={categoryName} />
          </CardBody>
        </Card>

        <ProductMetrics product={product} />

        <div className='grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
          <ProductInventoryTable product={product} />

          <div className='flex min-w-0 flex-col gap-5'>
            <ProductMerchandising product={product} tags={productTags} />
            <SeoCard
              slug={product.slug}
              metaTitle={product.metaTitle}
              metaDescription={product.metaDescription}
              metaKeywords={product.metaKeywords}
            />
          </div>
        </div>
      </div>

      {dialog}
    </>
  )
}

export default ProductDetailView
