import type { Metadata } from 'next'

import CreateCollectionView from '@views/collections/CreateCollectionView'

export const metadata: Metadata = {
  title: 'New Collection — Al Madina Admin'
}

const NewCollectionPage = () => <CreateCollectionView />

export default NewCollectionPage
