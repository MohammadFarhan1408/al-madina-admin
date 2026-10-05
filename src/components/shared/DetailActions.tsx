'use client'

import { useRouter } from 'next/navigation'

import Button from '@/components/ui/Button'

type DetailActionsProps = {
  backHref: string
  editHref?: string
  onDelete?: () => void
}

/** Back / Edit / Delete for a detail page's header. Wraps instead of
 *  overflowing at phone width — PageHeader already stretches the group. */
const DetailActions = ({ backHref, editHref, onDelete }: DetailActionsProps) => {
  const router = useRouter()

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button variant='outlined' color='secondary' onClick={() => router.push(backHref)}>
        Back
      </Button>
      {editHref && (
        <Button variant='outlined' startIcon={<i className='tabler-edit' />} onClick={() => router.push(editHref)}>
          Edit
        </Button>
      )}
      {onDelete && (
        <Button variant='outlined' color='error' startIcon={<i className='tabler-trash' />} onClick={onDelete}>
          Delete
        </Button>
      )}
    </div>
  )
}

export default DetailActions
