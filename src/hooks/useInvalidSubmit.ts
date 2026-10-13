'use client'

import { useCallback } from 'react'

import type { FieldErrors, FieldValues } from 'react-hook-form'

import { useToast } from '@/contexts/ToastContext'

/** Count leaf errors, including inside arrays/objects (variants.2.sku). */
const countErrors = (errors: object): number =>
  Object.values(errors).reduce<number>((n, value) => {
    if (!value || typeof value !== 'object') return n
    if ('message' in value && typeof (value as { message?: unknown }).message === 'string') return n + 1

    return n + countErrors(value)
  }, 0)

/** `handleSubmit(onValid, onInvalid)`'s second argument for every form: RHF
 *  already focuses the first bad field; this says how many need fixing, so a
 *  Save that "does nothing" on a long form — the error being two cards up —
 *  never happens. */
export function useInvalidSubmit<V extends FieldValues>() {
  const { error } = useToast()

  return useCallback(
    (errors: FieldErrors<V>) => {
      const count = countErrors(errors)

      error(count === 1 ? 'Fix the highlighted field to save' : `Fix the ${count} highlighted fields to save`)
    },
    [error]
  )
}
