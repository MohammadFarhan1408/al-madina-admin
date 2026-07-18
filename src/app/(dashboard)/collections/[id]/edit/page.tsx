import type { Metadata } from 'next'

import EditCollectionView from '@views/collections/EditCollectionView'

export const metadata: Metadata = {
  title: 'Edit Collection — Al Madina Admin'
}

type Props = { params: Promise<{ id: string }> }

const EditCollectionPage = async ({ params }: Props) => {
  const { id } = await params

  return <EditCollectionView id={id} />
}

export default EditCollectionPage
