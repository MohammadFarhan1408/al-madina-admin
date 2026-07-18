import type { Metadata } from 'next'

import CreateProductView from '@views/products/CreateProductView'

export const metadata: Metadata = {
  title: 'New Product — Al Madina Admin'
}

const NewProductPage = () => <CreateProductView />

export default NewProductPage
