// Broadcast history — read from the audit trail (doc §18), since a broadcast
// fans out into per-recipient Notification docs with no shared record of its
// own (see GET /admin/notifications).
import type { NotificationKind } from './schema'
import type { UserTier } from '@/features/customers/types'

export type BroadcastHistoryEntry = {
  id: string
  kind: NotificationKind
  title: string
  body: string
  tier?: UserTier
  actorEmail?: string
  createdAt: string
}

export type NotificationHistoryParams = {
  page?: number
  limit?: number
}
