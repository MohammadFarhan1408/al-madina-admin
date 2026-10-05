'use client'

import { useState, type ReactNode } from 'react'

import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'

type Options<T> = {

  /** Singular noun for the copy: "category" → "Delete category", "Category deleted". */
  entity: string
  remove: (item: T) => Promise<unknown>
  name: (item: T) => string
  onDeleted?: (item: T) => void
}

/** The ask → confirm → delete → toast flow every list and detail page repeated.
 *  Render `dialog` once; call `ask(item)` from a row action or button. */
export function useConfirmDelete<T>({ entity, remove, name, onDeleted }: Options<T>): {
  ask: (item: T) => void
  dialog: ReactNode
} {
  const { success, error } = useToast()
  const [target, setTarget] = useState<T | null>(null)
  const [pending, setPending] = useState(false)

  const confirm = async () => {
    if (!target) return

    setPending(true)

    try {
      await remove(target)
      success(`${entity.charAt(0).toUpperCase()}${entity.slice(1)} deleted`)
      setTarget(null)
      onDeleted?.(target)
    } catch (err) {
      error(getErrorMessage(err, `Failed to delete ${entity}`))
      setTarget(null)
    } finally {
      setPending(false)
    }
  }

  const dialog = (
    <ConfirmDialog
      open={target !== null}
      title={`Delete ${entity}`}
      description={target ? `Delete "${name(target)}"? This cannot be undone.` : undefined}
      confirmText='Delete'
      loading={pending}
      onConfirm={confirm}
      onClose={() => setTarget(null)}
    />
  )

  return { ask: setTarget, dialog }
}
