import { useEffect, useRef } from 'react'

import type { FieldValues, UseFormReset } from 'react-hook-form'

/** Seeds an edit form from the loaded entity — once per entity id. The old
 *  `useEffect(() => reset(...), [entity])` ran on every background refetch and
 *  silently wiped whatever the user had typed. */
export function useFormSync<V extends FieldValues, E extends { id: string }>(
  reset: UseFormReset<V>,
  entity: E | null | undefined,
  toValues: (entity: E) => V,
  defaults: V
) {
  const syncedId = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    const id = entity?.id ?? null

    if (syncedId.current === id) return

    syncedId.current = id
    reset(entity ? toValues(entity) : defaults)

    // toValues/defaults are stable by contract; only the entity identity matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, reset])
}
