import type { Metadata } from 'next'

import TagsView from '@views/tags/TagsView'

export const metadata: Metadata = {
  title: 'Tags — Al Madina Admin'
}

const TagsPage = () => <TagsView />

export default TagsPage
