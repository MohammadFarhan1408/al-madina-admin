'use client'

import { useEffect, useRef } from 'react'

import Button from '@/components/ui/Button'
import { useUnsavedGuard } from '@/hooks/useUnsavedGuard'

type FormActionsProps = {
  submitting?: boolean
  dirty?: boolean
  submitLabel?: string

  /** Tabler class for the submit button — `tabler-check` on a create form. */
  submitIcon?: string
  onCancel: () => void
}

/** Sticky Cancel/Save bar for a form, plus the unsaved-changes guard — so a
 *  long form's Save is always on screen and abandoning edits asks first. Place
 *  it inside the `<form>`, after the cards. */
const FormActions = ({
  submitting = false,
  dirty = false,
  submitLabel = 'Save changes',
  submitIcon = 'tabler-device-floppy',
  onCancel
}: FormActionsProps) => {
  const confirmLeave = useUnsavedGuard(dirty)
  const barRef = useRef<HTMLDivElement>(null)

  // ⌘S / Ctrl+S saves, instead of the browser's "Save page as…".
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 's' || !(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return

      e.preventDefault()
      if (!submitting) barRef.current?.closest('form')?.requestSubmit()
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [submitting])

  return (
    <div
      ref={barRef}
      className='sticky bottom-0 z-(--z-sticky) mt-4 flex items-center justify-end gap-3 border-t border-border bg-backgroundDefault/95 py-3 backdrop-blur'
    >
      <span className='mr-auto flex items-center gap-2 text-sm text-textMuted max-sm:hidden' aria-live='polite'>
        {dirty ? (
          <>
            <span aria-hidden className='size-2 rounded-full bg-warning' />
            Unsaved changes
          </>
        ) : (
          <span className='text-xs'>
            <kbd className='rounded-xs border border-border bg-backgroundPaper px-1 font-sans'>⌘S</kbd> /{' '}
            <kbd className='rounded-xs border border-border bg-backgroundPaper px-1 font-sans'>Ctrl S</kbd> to save
          </span>
        )}
      </span>
      <Button
        type='button'
        variant='outlined'
        color='secondary'
        startIcon={<i className='tabler-x' />}
        disabled={submitting}
        onClick={() => confirmLeave() && onCancel()}
        className='max-sm:flex-1'
      >
        Cancel
      </Button>
      <Button type='submit' loading={submitting} startIcon={<i className={submitIcon} />} className='max-sm:flex-1'>
        {submitLabel}
      </Button>
    </div>
  )
}

export default FormActions
