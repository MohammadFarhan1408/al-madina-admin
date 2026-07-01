import type { Metadata } from 'next'

import CollectionsView from '@views/collections/CollectionsView'

export const metadata: Metadata = {
  title: 'Collections — Al Madina Admin'
}

const CollectionsPage = () => <CollectionsView />

export default CollectionsPage
