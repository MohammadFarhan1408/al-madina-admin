'use client'

import { forwardRef, useEffect, useId, useRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

import classnames from 'classnames'

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode
  description?: ReactNode

  /** Tri-state "some children selected" mark; only settable via the DOM property. */
  indeterminate?: boolean
}

/** Native checkbox with the box drawn by a peer-styled span, so the mark, the
 *  focus ring and the disabled treatment match Radio and Switch rather than
 *  falling back to the OS control (which ignores `accent-color` sizing and
 *  looks foreign next to the gold system). */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, indeterminate, className, id, ...props }, ref) => {
    const innerRef = useRef<HTMLInputElement>(null)
    const reactId = useId()
    const checkboxId = id ?? props.name ?? reactId

    useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = Boolean(indeterminate)
    }, [indeterminate])

    return (
      <label
        htmlFor={checkboxId}
        className={classnames(
          'group inline-flex items-start gap-2.5 select-none',
          props.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          className
        )}
      >
        <span className='relative flex shrink-0 items-center justify-center pt-px'>
          <input
            ref={node => {
              innerRef.current = node
              if (typeof ref === 'function') ref(node)
              else if (ref) ref.current = node
            }}
            type='checkbox'
            id={checkboxId}
            className='peer sr-only'
            {...props}
          />
          <span
            aria-hidden
            className={classnames(
              'block size-[18px] rounded-xs border-2 border-borderControl bg-backgroundPaper transition-[border-color,background-color]',
              'group-hover:border-borderStrong peer-disabled:group-hover:border-borderControl',
              'peer-checked:border-primaryDark peer-checked:bg-primaryDark',
              'peer-indeterminate:border-primaryDark peer-indeterminate:bg-primaryDark',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-focus-visible:ring-offset-2'
            )}
          />
          <i
            aria-hidden
            className='tabler-check pointer-events-none absolute scale-50 text-[14px] text-white opacity-0 transition-[opacity,transform] duration-150 ease-out-quart peer-checked:scale-100 peer-checked:opacity-100 peer-indeterminate:hidden'
          />
          <i
            aria-hidden
            className='tabler-minus pointer-events-none absolute hidden text-[14px] text-white peer-indeterminate:block'
          />
        </span>
        {label && (
          <span className='flex min-w-0 flex-col gap-0.5'>
            <span className='text-sm leading-5 text-textPrimary'>{label}</span>
            {description && <span className='text-xs leading-4 text-textMuted'>{description}</span>}
          </span>
        )}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
