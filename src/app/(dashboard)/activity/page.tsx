import type { Metadata } from 'next'

import ActivityView from '@views/activity/ActivityView'

export const metadata: Metadata = {
  title: 'Activity — Al Madina Admin'
}

const ActivityPage = () => <ActivityView />

export default ActivityPage
