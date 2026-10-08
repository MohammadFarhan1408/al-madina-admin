// Activity log (GET /admin/activity) — admin mutations read from the audit trail.
export const ACTIVITY_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE'] as const
export type ActivityMethod = (typeof ACTIVITY_METHODS)[number]

export type ActivityEntry = {
  id: string
  actorEmail?: string
  method: ActivityMethod
  path: string
  statusCode?: number
  ip?: string
  createdAt: string
}

export type ActivityParams = {
  page?: number
  limit?: number
  q?: string
  method?: ActivityMethod
  from?: string
  to?: string
}

const VERBS: Record<ActivityMethod, string> = { POST: 'Created', PATCH: 'Updated', PUT: 'Replaced', DELETE: 'Deleted' }

/** "/v1/admin/orders/64f…/status" → "orders › status". Record ids are dropped. */
export const describeTarget = (path: string) =>
  path
    .replace(/^\/v1\/admin\//, '')
    .split('/')
    .filter(seg => seg && !/^[0-9a-f]{24}$/i.test(seg))
    .join(' › ')

export const describeAction = (e: Pick<ActivityEntry, 'method' | 'path'>) =>
  `${VERBS[e.method]} · ${describeTarget(e.path)}`
