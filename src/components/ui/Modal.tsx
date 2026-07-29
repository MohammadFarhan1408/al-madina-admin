'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import classnames from 'classnames'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export type ModalProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  size?: ModalSize
  className?: string
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
}

// Native <dialog> gives focus-trap, Esc-to-close, and ::backdrop for free.
const Modal = ({ open, onClose, children, size = 'md', className }: ModalProps) => {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current

    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      onClick={e => {
        if (e.target === ref.current) onClose()
      }}
      className={classnames(
        'w-full rounded-lg border border-secondary/30 bg-backgroundPaper p-0 text-textPrimary shadow-xl backdrop:bg-backdrop',
        sizeClasses[size],
        className
      )}
    >
      {children}
    </dialog>
  )
}

export type ModalHeaderProps = {
  children: ReactNode
  onClose?: () => void
  className?: string
}

export const ModalHeader = ({ children, onClose, className }: ModalHeaderProps) => (
  <div className={classnames('flex items-center justify-between gap-4 border-b border-secondary/20 p-4', className)}>
    <h2 className='text-base font-semibold'>{children}</h2>
    {onClose && (
      <button type='button' onClick={onClose} aria-label='Close' className='-m-1 rounded p-1 hover:bg-black/5'>
        <i className='tabler-x text-base' />
      </button>
    )}
  </div>
)

export type ModalBodyProps = { children: ReactNode; className?: string }

export const ModalBody = ({ children, className }: ModalBodyProps) => <div className={classnames('p-4', className)}>{children}</div>

export type ModalFooterProps = { children: ReactNode; className?: string }

export const ModalFooter = ({ children, className }: ModalFooterProps) => (
  <div className={classnames('flex items-center justify-end gap-2 border-t border-secondary/20 p-4', className)}>{children}</div>
)

export default Modal
