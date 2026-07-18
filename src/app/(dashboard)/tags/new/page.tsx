import type { Metadata } from 'next'

import CreateTagView from '@views/tags/CreateTagView'

export const metadata: Metadata = {
  title: 'New Tag — Al Madina Admin'
}

const NewTagPage = () => <CreateTagView />

export default NewTagPage
