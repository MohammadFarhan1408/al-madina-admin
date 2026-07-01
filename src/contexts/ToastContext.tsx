'use client'

// Lightweight global toast built on MUI Snackbar/Alert. Exposes a `toast` API
// used by feature mutations for success/error feedback.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import Snackbar from '@mui/material/Snackbar'
import Alert, { type AlertColor } from '@mui/material/Alert'

type ToastState = { open: boolean; message: string; severity: AlertColor }

type ToastContextValue = {
  toast: (message: string, severity?: AlertColor) => void
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ToastState>({ open: false, message: '', severity: 'success' })

  const toast = useCallback((message: string, severity: AlertColor = 'info') => {
    setState({ open: true, message, severity })
  }, [])

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
      <Snackbar
        open={state.open}
        autoHideDuration={4000}
        onClose={() => setState(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          variant='filled'
          severity={state.severity}
          onClose={() => setState(s => ({ ...s, open: false }))}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)

  if (!ctx) throw new Error('useToast must be used within a ToastProvider')

  return ctx
}
