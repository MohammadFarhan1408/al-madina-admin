'use client'

import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import QueryState from '@/components/shared/QueryState'
import ProductForm from '@/features/products/components/ProductForm'
import { useProduct } from '@/features/products/hooks/useProducts'

type Props = { id: string }

const EditProductView = ({ id }: Props) => {
  const router = useRouter()
  const { data: product, isLoading, isError, error, refetch } = useProduct(id)

  if (isLoading || !product) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Edit Product' />
        <QueryState isError={isError} error={error} onRetry={() => refetch()} fallbackMessage='Failed to load product.' />
      </>
    )
  }

  return (
    <>
      <Breadcrumbs extra={[{ label: product.name, href: `/products/${id}` }, { label: 'Edit' }]} />
      <PageHeader title={`Edit ${product.name}`} />
      <ProductForm
        product={product}
        onSuccess={() => router.push(`/products/${id}`)}
        onCancel={() => router.push(`/products/${id}`)}
      />
    </>
  )
}

export default EditProductView
