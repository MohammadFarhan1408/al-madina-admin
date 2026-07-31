'use client'

import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

import classnames from 'classnames'

import { CardTitle } from './Card'
import IconButton from './IconButton'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export type ModalProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  size?: ModalSize

  /** Accessible name for the dialog. Pass the same text as ModalHeader's, or
   *  wire `aria-labelledby` yourself if the heading is composed. */
  label?: string
  className?: string
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-100',
  md: 'max-w-125',
  lg: 'max-w-160',
  xl: 'max-w-4xl'
}

/** Native `<dialog>`: focus trap, Esc-to-close, inert background and
 *  `::backdrop` all come from the platform rather than a JS focus manager.
 *
 *  The panel is a flex column with a scrolling body, so a long form scrolls
 *  inside the dialog while the header and footer actions stay put — a modal
 *  whose Save button is below the fold is a modal that loses work. */
const Modal = ({ open, onClose, children, size = 'md', label, className }: ModalProps) => {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current

    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Lock background scroll while open — otherwise the page behind the backdrop
  // still scrolls on wheel/touch in Chrome and Safari.
  useEffect(() => {
    if (!open) return

    const previous = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onCancel={onClose}
      onClick={e => {
        if (e.target === ref.current) onClose()
      }}
      className={classnames(
        'm-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-border',
        'bg-backgroundPaper p-0 text-textPrimary shadow-xl',
        'open:flex open:animate-overlay-in',
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
  description?: ReactNode
  onClose?: () => void
  className?: string
}

export const ModalHeader = ({ children, description, onClose, className }: ModalHeaderProps) => {
  const id = useId()

  return (
    <div
      className={classnames(
        'flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4',
        className
      )}
    >
      <div className='flex min-w-0 flex-col gap-1'>
        <CardTitle id={id} className='whitespace-normal'>
          {children}
        </CardTitle>
        {description && <p className='text-sm text-textMuted'>{description}</p>}
      </div>
      {onClose && (
        <IconButton size='sm' aria-label='Close dialog' onClick={onClose} className='-mr-1.5'>
          <i className='tabler-x' />
        </IconButton>
      )}
    </div>
  )
}

export type ModalBodyProps = { children: ReactNode; className?: string }

/** Scrolls independently so the footer actions never leave the viewport. */
export const ModalBody = ({ children, className }: ModalBodyProps) => (
  <div className={classnames('min-h-0 flex-1 overflow-y-auto px-5 py-4', className)}>{children}</div>
)

export type ModalFooterProps = { children: ReactNode; className?: string }

/** Actions are right-aligned with the confirming action last, matching the
 *  platform convention the rest of the admin follows. On narrow screens they
 *  stack full-width so neither button ends up a 60px tap target. */
export const ModalFooter = ({ children, className }: ModalFooterProps) => (
  <div
    className={classnames(
      'flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-backgroundDefault/60 px-5 py-4',
      'sm:flex-row sm:items-center sm:justify-end',
      '[&>button]:w-full sm:[&>button]:w-auto',
      className
    )}
  >
    {children}
  </div>
)

export default Modal
