// Notifications service (doc §7.12 — admin broadcast + history).
import { apiGet, apiPost } from '@/libs/api/axios'
import { endpoints } from '@/libs/api/endpoints'
import type { Paginated } from '@/libs/api/types'

import type { BroadcastFormValues } from '../schema'
import type { BroadcastHistoryEntry, NotificationHistoryParams } from '../types'

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
  },

  history: (params: NotificationHistoryParams) =>
    apiGet<Paginated<BroadcastHistoryEntry>>(endpoints.admin.notifications, { params })
}
