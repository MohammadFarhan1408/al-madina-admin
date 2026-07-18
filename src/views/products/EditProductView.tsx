'use client'

import { useRouter } from 'next/navigation'

import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import ProductForm from '@/features/products/components/ProductForm'
import { useProduct } from '@/features/products/hooks/useProducts'

type Props = { id: string }

const EditProductView = ({ id }: Props) => {
  const router = useRouter()
  const { data: product, isLoading, isError, error } = useProduct(id)

  if (isLoading || !product) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Edit Product' />
        {isError ? (
          <Alert severity='error'>{(error as Error)?.message || 'Failed to load product.'}</Alert>
        ) : (
          <div className='flex justify-center p-8'>
            <CircularProgress />
          </div>
        )}
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
