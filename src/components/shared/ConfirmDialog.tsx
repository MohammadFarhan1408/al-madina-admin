'use client'

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

/** Reusable confirmation dialog for destructive/irreversible actions. */
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
}: ConfirmDialogProps) => (
  <Modal open={open} onClose={loading ? () => {} : onClose} size='sm'>
    <ModalHeader>{title}</ModalHeader>
    {description && <ModalBody className='text-sm text-textSecondary'>{description}</ModalBody>}
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

export default ConfirmDialog
