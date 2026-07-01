'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import type { ButtonProps } from '@mui/material/Button'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirmColor?: ButtonProps['color']
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
  <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth='xs' fullWidth>
    <DialogTitle>{title}</DialogTitle>
    {description && (
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
    )}
    <DialogActions>
      <Button color='secondary' variant='tonal' onClick={onClose} disabled={loading}>
        {cancelText}
      </Button>
      <Button color={confirmColor} variant='contained' onClick={onConfirm} disabled={loading}>
        {loading ? <CircularProgress size={20} color='inherit' /> : confirmText}
      </Button>
    </DialogActions>
  </Dialog>
)

export default ConfirmDialog
