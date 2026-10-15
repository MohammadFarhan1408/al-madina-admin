'use client'

import IconButton from '@/components/ui/IconButton'
import { useToast } from '@/contexts/ToastContext'

type CopyValueButtonProps = {
  value: string

  /** What's being copied, for the accessible name and the toast ("Slug"). */
  label: string
}

/** Small icon button that copies a read-only value (ID, slug, SKU) — the
 *  things an admin pastes into a support thread or a URL bar. */
const CopyValueButton = ({ value, label }: CopyValueButtonProps) => {
  const { success, error } = useToast()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      success(`${label} copied`)
    } catch {
      error(`Couldn't copy ${label.toLowerCase()}`)
    }
  }

  return (
    <IconButton
      size='sm'
      aria-label={`Copy ${label.toLowerCase()}`}
      title={`Copy ${label.toLowerCase()}`}
      onClick={copy}
    >
      <i className='tabler-copy' />
    </IconButton>
  )
}

export default CopyValueButton
