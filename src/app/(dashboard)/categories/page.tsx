import type { Metadata } from 'next'

import CategoriesView from '@views/categories/CategoriesView'

export const metadata: Metadata = {
  title: 'Categories — Al Madina Admin'
}

const CategoriesPage = () => <CategoriesView />

export default CategoriesPage
