'use client'

import { useRouter } from 'next/navigation'

import Button from '@/components/ui/Button'

type DetailActionsProps = {
  editHref?: string
  editLabel?: string
  onDelete?: () => void
}

/** Delete / Edit for a detail page's header, primary action last. Back lives
 *  in PageHeader's `backHref`. Rendered as a fragment: PageHeader lays the
 *  group out and wraps it below the title on phones. */
const DetailActions = ({ editHref, editLabel = 'Edit', onDelete }: DetailActionsProps) => {
  const router = useRouter()

  return (
    <>
      {onDelete && (
        <Button variant='outlined' color='error' startIcon={<i className='tabler-trash' />} onClick={onDelete}>
          Delete
        </Button>
      )}
      {editHref && (
        <Button startIcon={<i className='tabler-edit' />} onClick={() => router.push(editHref)}>
          {editLabel}
        </Button>
      )}
    </>
  )
}

export default DetailActions
