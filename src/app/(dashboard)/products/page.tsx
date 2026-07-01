import type { Metadata } from 'next'

import ProductsView from '@views/products/ProductsView'

export const metadata: Metadata = {
  title: 'Products — Al Madina Admin'
}

const ProductsPage = () => <ProductsView />

export default ProductsPage
