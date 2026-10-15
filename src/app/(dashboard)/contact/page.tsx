import type { Metadata } from 'next'

import ContactMessagesView from '@views/contact/ContactMessagesView'

export const metadata: Metadata = {
  title: 'Messages — Al Madina Admin'
}

const ContactPage = () => <ContactMessagesView />

export default ContactPage
