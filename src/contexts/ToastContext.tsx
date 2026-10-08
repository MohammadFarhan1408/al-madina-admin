'use client'

// Global toast. Exposes a `toast` API used by feature mutations for
// success/error feedback.
//
// Toasts stack rather than replacing one another: two mutations resolving in
// quick succession used to mean the first message was silently overwritten
// before anyone read it. Errors also persist longer than confirmations, since
// they're the ones a user actually needs to act on.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import Alert, { type AlertSeverity } from '@/components/ui/Alert'

/** One-click recovery, e.g. `{ label: 'Undo', onClick: restore }`. */
type ToastAction = { label: string; onClick: () => void }

type Toast = { id: number; message: string; severity: AlertSeverity; action?: ToastAction }

type ToastContextValue = {
  toast: (message: string, severity?: AlertSeverity, action?: ToastAction) => void
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/** Errors linger; confirmations get out of the way. */
const DURATION: Record<AlertSeverity, number> = {
  error: 8000,
  warning: 6500,
  info: 5000,
  success: 4000
}

const MAX_VISIBLE = 3

/** Owns its own dismiss timer so it is cleared on unmount, and paused while the
 *  stack is hovered or focused — a toast with an Undo button must not vanish
 *  under the cursor (WCAG 2.2.1). */
const ToastItem = ({ toast: t, paused, onDismiss }: { toast: Toast; paused: boolean; onDismiss: (id: number) => void }) => {
  useEffect(() => {
    if (paused) return

    const timer = setTimeout(() => onDismiss(t.id), DURATION[t.severity])

    return () => clearTimeout(timer)
  }, [paused, t.id, t.severity, onDismiss])

  return (
    <Alert
      severity={t.severity}
      onClose={() => onDismiss(t.id)}
      action={
        t.action && (
          <button
            type='button'
            className='rounded px-2 py-1 text-sm font-semibold underline underline-offset-2 pointer-coarse:min-h-11'
            onClick={() => {
              t.action?.onClick()
              onDismiss(t.id)
            }}
          >
            {t.action.label}
          </button>
        )
      }
      className='pointer-events-auto w-full animate-toast-in shadow-lg'
    >
      {t.message}
    </Alert>
  )
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [paused, setPaused] = useState(false)
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts(current => current.filter(t => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, severity: AlertSeverity = 'info', action?: ToastAction) => {
      const id = nextId.current++

      setToasts(current => {
        // Collapse an identical consecutive message instead of stacking the
        // same text twice — a double-submitted mutation shouldn't read as two
        // separate failures.
        if (current.at(-1)?.message === message) return current

        return [...current, { id, message, severity, action }].slice(-MAX_VISIBLE)
      })
    },
    []
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (message: string) => toast(message, 'success'),
      error: (message: string) => toast(message, 'error')
    }),
    [toast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Bottom-right, raised to clear the scroll-to-top button. `aria-live`
          sits on the persistent region — not on the toasts — because a live
          region has to exist before its content changes to be announced. */}
      <div
        aria-live='polite'
        aria-relevant='additions'
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className='pointer-events-none fixed inset-x-4 bottom-20 z-(--z-toast) flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5 sm:w-96'
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} paused={paused} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)

  if (!ctx) throw new Error('useToast must be used within a ToastProvider')

  return ctx
}
