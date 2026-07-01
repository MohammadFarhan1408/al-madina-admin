// Broadcast notification schema (doc §7.12 — POST /admin/notifications).
import { z } from 'zod'

import { USER_TIERS } from '@/features/customers/types'

// Notification kinds available to the mobile app (doc §5.8).
export const NOTIFICATION_KINDS = ['system', 'promo', 'order', 'wishlist'] as const
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number]

export const broadcastSchema = z.object({
  kind: z.enum(NOTIFICATION_KINDS),
  title: z.string().trim().min(1, 'Title is required'),
  body: z.string().trim().min(1, 'Message is required'),

  // Empty string = broadcast to everyone; otherwise target a loyalty tier.
  tier: z.union([z.enum(USER_TIERS as [string, ...string[]]), z.literal('')])
})

export type BroadcastFormValues = z.infer<typeof broadcastSchema>

export const defaultBroadcastValues: BroadcastFormValues = {
  kind: 'promo',
  title: '',
  body: '',
  tier: ''
}
