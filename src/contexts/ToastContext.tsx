'use client'

// Global toast. Exposes a `toast` API used by feature mutations for
// success/error feedback.
//
// Toasts stack rather than replacing one another: two mutations resolving in
// quick succession used to mean the first message was silently overwritten
// before anyone read it. Errors also persist longer than confirmations, since
// they're the ones a user actually needs to act on.

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

import Alert, { type AlertSeverity } from '@/components/ui/Alert'

type Toast = { id: number; message: string; severity: AlertSeverity }

type ToastContextValue = {
  toast: (message: string, severity?: AlertSeverity) => void
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

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts(current => current.filter(t => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, severity: AlertSeverity = 'info') => {
      const id = nextId.current++

      setToasts(current => {
        // Collapse an identical consecutive message instead of stacking the
        // same text twice — a double-submitted mutation shouldn't read as two
        // separate failures.
        if (current.at(-1)?.message === message) return current

        return [...current, { id, message, severity }].slice(-MAX_VISIBLE)
      })

      setTimeout(() => dismiss(id), DURATION[severity])
    },
    [dismiss]
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

      {/* Bottom-right, clear of the sticky header and the account menu the
          previous top-right placement used to cover. `aria-live` sits on the
          persistent region — not on the toasts — because a live region has to
          exist before its content changes to be announced at all. */}
      <div
        aria-live='polite'
        aria-relevant='additions'
        className='pointer-events-none fixed inset-x-4 bottom-4 z-(--z-toast) flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-96'
      >
        {toasts.map(t => (
          <Alert
            key={t.id}
            severity={t.severity}
            onClose={() => dismiss(t.id)}
            className='pointer-events-auto w-full animate-toast-in shadow-lg'
          >
            {t.message}
          </Alert>
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
