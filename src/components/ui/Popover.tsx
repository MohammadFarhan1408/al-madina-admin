import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import classnames from 'classnames'

/** The floating-surface treatment shared by every anchored overlay — the menu
 *  Dropdown, the Combobox listbox and the SearchSelect listbox all rendered
 *  their own near-identical copy of this before.
 *
 *  `z-[var(--z-popover)]` keeps the layer decision in the token file instead of
 *  scattered raw z-index values. */
export const popoverSurface = classnames(
  'z-(--z-popover) overflow-y-auto overscroll-contain rounded-md border border-border',
  'bg-backgroundPaper p-1 shadow-lg outline-none'
)

export type PopoverOptionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean

  /** True for the row under the keyboard cursor — visually distinct from
   *  `selected`, since the two move independently. */
  active?: boolean
  icon?: ReactNode
  danger?: boolean

  /** Reserve the check-mark gutter even when nothing is selected, so labels in
   *  a single-select list don't shift as the selection moves. */
  showCheck?: boolean
}

/** One row inside a popover list. Height, padding, radius and the hover/active
 *  treatment are fixed here so menus and listboxes never drift apart. */
export const PopoverOption = forwardRef<HTMLButtonElement, PopoverOptionProps>(
  (
    { selected = false, active = false, icon, danger = false, showCheck = false, className, children, ...props },
    ref
  ) => (
    <button
      ref={ref}
      type='button'
      aria-selected={props.role === 'option' ? selected : undefined}
      className={classnames(
        'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
        'disabled:pointer-events-none disabled:opacity-45',
        danger ? 'text-error' : 'text-textPrimary',
        active && (danger ? 'bg-error/12' : 'bg-primary/14'),
        !active && (danger ? 'hover:bg-error/10' : 'hover:bg-actionHover'),
        selected && !active && 'bg-primary/8',
        selected && 'font-medium',
        className
      )}
      {...props}
    >
      {showCheck && (
        <i
          aria-hidden
          className={classnames(
            'tabler-check shrink-0 text-[16px] text-primaryInk',
            selected ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
      {icon && (
        <span aria-hidden className='flex shrink-0 items-center text-[18px]'>
          {icon}
        </span>
      )}
      <span className='min-w-0 flex-1 truncate'>{children}</span>
    </button>
  )
)

PopoverOption.displayName = 'PopoverOption'

/** Non-interactive row for the empty / loading / hint states of a list, so
 *  those messages get the same insets as real options. */
export const PopoverMessage = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={classnames('px-2.5 py-2 text-sm text-textMuted', className)}>{children}</p>
)
