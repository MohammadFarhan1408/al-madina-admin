import type { Metadata } from 'next'

import NotificationsView from '@views/notifications/NotificationsView'

export const metadata: Metadata = {
  title: 'Notifications — Al Madina Admin'
}

const NotificationsPage = () => <NotificationsView />

export default NotificationsPage
