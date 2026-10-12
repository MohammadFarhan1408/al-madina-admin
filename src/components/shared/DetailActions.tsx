'use client'

import { useRouter } from 'next/navigation'

import Button from '@/components/ui/Button'

type DetailActionsProps = {
  backHref: string

  /** Names where Back goes, e.g. "Back to products". */
  backLabel?: string
  editHref?: string
  editLabel?: string
  onDelete?: () => void
}

/** Back / Delete / Edit for a detail page's header, primary action last.
 *  Rendered as a fragment: PageHeader lays the group out and wraps it below
 *  the title on phones. */
const DetailActions = ({
  backHref,
  backLabel = 'Back',
  editHref,
  editLabel = 'Edit',
  onDelete
}: DetailActionsProps) => {
  const router = useRouter()

  return (
    <>
      <Button
        variant='text'
        color='secondary'
        startIcon={<i className='tabler-arrow-left' />}
        onClick={() => router.push(backHref)}
      >
        {backLabel}
      </Button>
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
