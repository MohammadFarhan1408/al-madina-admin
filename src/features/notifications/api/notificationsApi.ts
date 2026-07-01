// Notifications service (doc §7.12 — admin broadcast).
import { apiPost } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'

import type { BroadcastFormValues } from '../schema'

export const notificationsApi = {
  broadcast: (values: BroadcastFormValues) => {
    // Omit tier entirely when broadcasting to everyone.
    const payload = {
      kind: values.kind,
      title: values.title,
      body: values.body,
      ...(values.tier ? { tier: values.tier } : {})
    }

    return apiPost<{ queued: boolean }>(endpoints.admin.notifications, payload)
  }
}
