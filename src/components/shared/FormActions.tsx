'use client'

import Button from '@/components/ui/Button'
import { useUnsavedGuard } from '@/hooks/useUnsavedGuard'

type FormActionsProps = {
  submitting?: boolean
  dirty?: boolean
  submitLabel?: string
  onCancel: () => void
}

/** Sticky Cancel/Save bar for a form, plus the unsaved-changes guard — so a
 *  long form's Save is always on screen and abandoning edits asks first. Place
 *  it inside the `<form>`, after the cards. */
const FormActions = ({ submitting = false, dirty = false, submitLabel = 'Save changes', onCancel }: FormActionsProps) => {
  const confirmLeave = useUnsavedGuard(dirty)

  return (
    <div className='sticky bottom-0 z-(--z-sticky) mt-4 flex items-center justify-end gap-3 border-t border-border bg-backgroundDefault/95 py-3 backdrop-blur'>
      {dirty && <span className='mr-auto text-sm text-textMuted max-sm:hidden'>Unsaved changes</span>}
      <Button
        type='button'
        variant='outlined'
        color='secondary'
        disabled={submitting}
        onClick={() => confirmLeave() && onCancel()}
        className='max-sm:flex-1'
      >
        Cancel
      </Button>
      <Button type='submit' loading={submitting} className='max-sm:flex-1'>
        {submitLabel}
      </Button>
    </div>
  )
}

export default FormActions
