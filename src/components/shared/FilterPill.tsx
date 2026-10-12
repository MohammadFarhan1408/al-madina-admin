'use client'

// The toolbar filter trigger shared by FilterSelect, DateRangeFilter and
// PriceRangeFilter, plus the popover plumbing they all need. One trigger
// style means every secondary filter on every list page reads the same:
// "Category" when unset, "Category: Oud Perfumes" (gold-tinted) when set.
import { forwardRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'

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
  useRole
} from '@floating-ui/react'
import classnames from 'classnames'

import { controlHeight } from '@/components/ui/form/Field'

type FilterPillProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label: string

  /** The applied value's display text; omit when the filter is unset. */
  valueLabel?: ReactNode
  icon?: string
  open?: boolean
}

export const FilterPill = forwardRef<HTMLButtonElement, FilterPillProps>(
  ({ label, valueLabel, icon, open = false, className, ...props }, ref) => {
    const active = valueLabel !== undefined && valueLabel !== null && valueLabel !== ''

    return (
      <button
        ref={ref}
        type='button'
        aria-haspopup='dialog'
        aria-expanded={open}
        className={classnames(
          controlHeight,
          'inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-md border px-3 text-sm whitespace-nowrap',
          'transition-[color,background-color,border-color,box-shadow]',
          'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:outline-none',
          active
            ? 'border-primary/70 bg-primary/12 text-primaryInk hover:bg-primary/18'
            : 'border-border bg-backgroundPaper text-textSecondary hover:border-borderStrong hover:text-textPrimary',
          open && 'border-primary ring-2 ring-primary/35',
          className
        )}
        {...props}
      >
        {icon && <i aria-hidden className={classnames(icon, 'shrink-0 text-base')} />}
        <span className={active ? 'font-medium' : undefined}>{label}</span>
        {active && (
          <>
            <span aria-hidden className='opacity-60'>
              ·
            </span>
            <span className='max-w-44 truncate font-medium'>{valueLabel}</span>
          </>
        )}
        <i
          aria-hidden
          className={classnames(
            'tabler-chevron-down shrink-0 text-[15px] opacity-70 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>
    )
  }
)

FilterPill.displayName = 'FilterPill'

/** Anchored, dismissable popover state for a FilterPill. `onOpen` runs as the
 *  popover opens — use it to reset a draft to the applied value. */
export function useFilterPopover({ onOpen, matchWidth = false }: { onOpen?: () => void; matchWidth?: boolean } = {}) {
  const [open, setOpen] = useState(false)

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open,
    onOpenChange: next => {
      setOpen(next)
      if (next) onOpen?.()
    },
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableHeight, rects, elements }) {
          elements.floating.style.maxHeight = `${Math.max(availableHeight, 200)}px`
          if (matchWidth) elements.floating.style.minWidth = `${rects.reference.width}px`
        }
      })
    ]
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role: 'dialog' })
  ])

  return {
    open,
    setOpen,
    reference: (props?: Record<string, unknown>) => getReferenceProps({ ref: refs.setReference, ...props }),
    floating: (className: string, props?: Record<string, unknown>) =>
      getFloatingProps({
        ref: refs.setFloating,
        style: { ...floatingStyles, opacity: isPositioned ? 1 : 0 },
        className,
        ...props
      })
  }
}
