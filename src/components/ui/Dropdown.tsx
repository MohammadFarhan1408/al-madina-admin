'use client'

import { cloneElement, isValidElement, useState } from 'react'
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react'

import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  FloatingFocusManager
} from '@floating-ui/react'
import classnames from 'classnames'

export type DropdownProps = {
  trigger: ReactElement
  children: ReactNode
  align?: 'start' | 'end'
  className?: string
}

// Anchored popover + keyboard nav, shared shape used by both the plain
// menu-style Dropdown here and Combobox's listbox.
const Dropdown = ({ trigger, children, align = 'start', className }: DropdownProps) => {
  const [open, setOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: align === 'end' ? 'bottom-end' : 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip(),
      shift({ padding: 8 }),
      size({
        apply({ availableHeight, elements }) {
          Object.assign(elements.floating.style, { maxHeight: `${Math.min(availableHeight, 320)}px` })
        }
      })
    ]
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role: 'menu' })
  ])

  return (
    <>
      {isValidElement(trigger) &&
        cloneElement(trigger as ReactElement<Record<string, unknown>>, {
          ref: refs.setReference,
          ...getReferenceProps()
        })}
      {open && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className={classnames(
              'z-50 min-w-[10rem] overflow-auto rounded-md border border-secondary/30 bg-backgroundPaper py-1 shadow-lg',
              className
            )}
          >
            {children}
          </div>
        </FloatingFocusManager>
      )}
    </>
  )
}

export type DropdownItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  danger?: boolean
  icon?: ReactNode
}

export const DropdownItem = ({ danger = false, icon, className, children, ...props }: DropdownItemProps) => (
  <button
    type='button'
    role='menuitem'
    className={classnames(
      'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-primary/10 disabled:opacity-50',
      danger ? 'text-error' : 'text-textPrimary',
      className
    )}
    {...props}
  >
    {icon}
    {children}
  </button>
)

export default Dropdown
