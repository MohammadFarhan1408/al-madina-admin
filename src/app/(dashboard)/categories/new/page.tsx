import type { Metadata } from 'next'

import CreateCategoryView from '@views/categories/CreateCategoryView'

export const metadata: Metadata = {
  title: 'New Category — Al Madina Admin'
}

const NewCategoryPage = () => <CreateCategoryView />

export default NewCategoryPage
