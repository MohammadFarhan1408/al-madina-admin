import { Suspense } from 'react'

import type { Metadata } from 'next'

import ProductsView from '@views/products/ProductsView'
import BrandLoader from '@components/shared/BrandLoader'

export const metadata: Metadata = {
  title: 'Products — Al Madina Admin'
}

const ProductsPage = () => (
  <Suspense fallback={<BrandLoader />}>
    <ProductsView />
  </Suspense>
)

export default ProductsPage
