import { useCallback, useEffect } from 'react'

const MESSAGE = 'You have unsaved changes. Leave without saving?'

/** Warns before a dirty form is abandoned. Covers reload/close (`beforeunload`)
 *  and in-app link clicks (sidebar, breadcrumbs). Returns `confirmLeave()` for
 *  buttons that leave programmatically, e.g. Cancel.
 *  ponytail: native confirm(), and browser Back isn't covered — the App Router
 *  has no route-change blocker; swap in a Modal if the native dialog grates. */
export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return

    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('a[href]')

      if (!a || a.getAttribute('href')?.startsWith('#') || a.getAttribute('target') === '_blank') return

      if (!window.confirm(MESSAGE)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('click', onClick, true)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('click', onClick, true)
    }
  }, [dirty])

  return useCallback(() => !dirty || window.confirm(MESSAGE), [dirty])
}
