'use client'

// Lightweight global toast. Exposes a `toast` API used by feature mutations
// for success/error feedback.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import Alert, { type AlertSeverity } from '@/components/ui/Alert'

type ToastState = { open: boolean; message: string; severity: AlertSeverity }

type ToastContextValue = {
  toast: (message: string, severity?: AlertSeverity) => void
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ToastState>({ open: false, message: '', severity: 'success' })

  const toast = useCallback((message: string, severity: AlertSeverity = 'info') => {
    setState({ open: true, message, severity })
  }, [])

  useEffect(() => {
    if (!state.open) return

    const timer = setTimeout(() => setState(s => ({ ...s, open: false })), 4000)

    return () => clearTimeout(timer)
  }, [state.open, state.message])

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
      {state.open && (
        <div className='fixed right-4 top-4 z-100 w-full max-w-sm'>
          <Alert severity={state.severity} onClose={() => setState(s => ({ ...s, open: false }))} className='shadow-lg'>
            {state.message}
          </Alert>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)

  if (!ctx) throw new Error('useToast must be used within a ToastProvider')

  return ctx
}
