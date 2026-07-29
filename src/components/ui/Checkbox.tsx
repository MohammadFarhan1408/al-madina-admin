'use client'

import { forwardRef, useEffect, useRef } from 'react'
import type { InputHTMLAttributes } from 'react'

import classnames from 'classnames'

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string

  /** Tri-state "some children selected" mark; only settable via the DOM property. */
  indeterminate?: boolean
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, indeterminate, className, id, ...props }, ref) => {
  const innerRef = useRef<HTMLInputElement>(null)
  const checkboxId = id ?? props.name

  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = Boolean(indeterminate)
  }, [indeterminate])

  return (
    <label htmlFor={checkboxId} className='inline-flex cursor-pointer select-none items-center gap-2'>
      <input
        ref={node => {
          innerRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        type='checkbox'
        id={checkboxId}
        className={classnames(
          'size-4 rounded border-secondary/40 accent-primary focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50',
          className
        )}
        {...props}
      />
      {label && <span className='text-sm text-textPrimary'>{label}</span>}
    </label>
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox
