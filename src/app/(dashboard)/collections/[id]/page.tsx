import type { Metadata } from 'next'

import CollectionDetailView from '@views/collections/CollectionDetailView'

export const metadata: Metadata = {
  title: 'Collection — Al Madina Admin'
}

type Props = { params: Promise<{ id: string }> }

const CollectionDetailPage = async ({ params }: Props) => {
  const { id } = await params

  return <CollectionDetailView id={id} />
}

export default CollectionDetailPage
