'use client'

import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import ProductForm from '@/features/products/components/ProductForm'

const CreateProductView = () => {
  const router = useRouter()

  return (
    <>
      <Breadcrumbs extra={[{ label: 'New Product' }]} />
      <PageHeader title='New Product' subtitle='Add a new fragrance to the catalogue' />
      <ProductForm onSuccess={product => router.push(`/products/${product.id}`)} onCancel={() => router.push('/products')} />
    </>
  )
}

export default CreateProductView
