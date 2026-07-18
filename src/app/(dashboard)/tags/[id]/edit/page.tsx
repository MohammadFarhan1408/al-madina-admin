import type { Metadata } from 'next'

import EditTagView from '@views/tags/EditTagView'

export const metadata: Metadata = {
  title: 'Edit Tag — Al Madina Admin'
}

type Props = { params: Promise<{ id: string }> }

const EditTagPage = async ({ params }: Props) => {
  const { id } = await params

  return <EditTagView id={id} />
}

export default EditTagPage
