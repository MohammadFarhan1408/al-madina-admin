import type { Metadata } from 'next'

import ProductDetailView from '@views/products/ProductDetailView'

export const metadata: Metadata = {
  title: 'Product — Al Madina Admin'
}

type Props = { params: Promise<{ id: string }> }

const ProductDetailPage = async ({ params }: Props) => {
  const { id } = await params

  return <ProductDetailView id={id} />
}

export default ProductDetailPage
