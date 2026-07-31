'use client'

import classnames from 'classnames'

import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/components/ui/Modal'
import Button, { type ButtonColor } from '@/components/ui/Button'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirmColor?: ButtonColor
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

const severityIcon: Partial<Record<ButtonColor, { icon: string; classes: string }>> = {
  error: { icon: 'tabler-trash', classes: 'bg-error/12 text-error' },
  warning: { icon: 'tabler-alert-triangle', classes: 'bg-warning/18 text-warningInk' },
  success: { icon: 'tabler-circle-check', classes: 'bg-success/12 text-successDark' },
  primary: { icon: 'tabler-help-circle', classes: 'bg-primary/16 text-primaryInk' }
}

/** Confirmation dialog for destructive or irreversible actions.
 *
 *  The icon and the confirm button share one colour, so the visual weight of
 *  the dialog matches the consequence of the action. Cancel is placed before
 *  Confirm and is the safe default; the dialog can't be dismissed mid-request,
 *  which would leave the user unsure whether the action went through. */
const ConfirmDialog = ({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'error',
  loading = false,
  onConfirm,
  onClose
}: ConfirmDialogProps) => {
  const severity = severityIcon[confirmColor] ?? severityIcon.primary!

  return (
    <Modal open={open} onClose={loading ? () => {} : onClose} size='sm' label={title}>
      <ModalHeader onClose={loading ? undefined : onClose}>{title}</ModalHeader>
      <ModalBody>
        <div className='flex items-start gap-3.5'>
          <span
            aria-hidden
            className={classnames('flex size-10 shrink-0 items-center justify-center rounded-full', severity.classes)}
          >
            <i className={classnames(severity.icon, 'text-[20px]')} />
          </span>
          <p className='pt-2 text-sm text-textSecondary'>{description ?? 'This action cannot be undone.'}</p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant='outlined' color='secondary' onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button color={confirmColor} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default ConfirmDialog
