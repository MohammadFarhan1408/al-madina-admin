'use client'

import { Children, cloneElement, forwardRef, isValidElement, useRef, useState } from 'react'
import type { MouseEvent, ReactElement, ReactNode } from 'react'

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
  useListNavigation,
  useRole,
  useTypeahead,
  FloatingFocusManager,
  FloatingPortal
} from '@floating-ui/react'
import classnames from 'classnames'

import { PopoverOption, popoverSurface, type PopoverOptionProps } from './Popover'

export type DropdownProps = {
  trigger: ReactElement
  children: ReactNode
  align?: 'start' | 'end'

  /** Labels for typeahead — pressing "d" jumps to "Delete". Pass in the same
   *  order as the rendered items; omit to disable. */
  itemLabels?: (string | null)[]
  className?: string
}

/** Anchored menu. Rendered through a portal so it can never be clipped by an
 *  ancestor's `overflow: hidden` — the failure mode that hides a row's action
 *  menu inside a scrolling table.
 *
 *  Arrow keys move between items, Home/End jump to the ends, typing letters
 *  jumps to a matching item, and Esc returns focus to the trigger. */
const Dropdown = ({ trigger, children, align = 'start', itemLabels, className }: DropdownProps) => {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const listRef = useRef<(HTMLElement | null)[]>([])
  const labelsRef = useRef<(string | null)[]>(itemLabels ?? [])

  labelsRef.current = itemLabels ?? []

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: align === 'end' ? 'bottom-end' : 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ availableHeight, elements }) {
          Object.assign(elements.floating.style, { maxHeight: `${Math.min(availableHeight - 8, 320)}px` })
        }
      })
    ]
  })

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role: 'menu' }),
    useListNavigation(context, { listRef, activeIndex, onNavigate: setActiveIndex, loop: true }),
    useTypeahead(context, { listRef: labelsRef, activeIndex, onMatch: setActiveIndex, enabled: Boolean(itemLabels) })
  ])

  // `Children.toArray` so a menu with a single item is registered too — the
  // old `Array.isArray` check skipped it, leaving it out of keyboard nav.
  const items = Children.toArray(children)

  let itemIndex = 0

  return (
    <>
      {isValidElement(trigger) &&
        cloneElement(trigger as ReactElement<Record<string, unknown>>, {
          ref: refs.setReference,
          ...getReferenceProps()
        })}
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} returnFocus>
            <div
              {...getFloatingProps({
                ref: refs.setFloating,

                // The menu mounts at the top-left corner and is only moved into
                // place after it has been measured — one frame later. Without
                // this it is visibly painted in the wrong corner first. Opacity
                // rather than visibility, so the focus manager can still move
                // focus into it on that first frame.
                style: { ...floatingStyles, opacity: isPositioned ? 1 : 0 },
                className: classnames(popoverSurface, className)
              })}
            >
              {/* Register each item with the keyboard navigator without making
                  callers thread refs and props through by hand.

                  Two things this has to get right:
                  - the item's own props go *through* `getItemProps`, not around
                    it. `cloneElement`'s config overrides the element's props,
                    and `getItemProps` returns its own `onClick`, so passing
                    them separately silently threw away every caller's click
                    handler. Composed this way, both run.
                  - only real `DropdownItem`s are registered. Menus also contain
                    identity blocks and separators; counting those would point
                    the arrow keys and `itemLabels` at rows that can't be
                    activated. */}
              {items.map((child, i) => {
                if (!isValidElement(child) || child.type !== DropdownItem) return child

                const index = itemIndex++
                const itemOnClick = (child.props as DropdownItemProps).onClick

                return cloneElement(child as ReactElement<Record<string, unknown>>, {
                  key: child.key ?? i,
                  ...getItemProps({
                    ...(child.props as Record<string, unknown>),
                    ref(node: HTMLElement | null) {
                      listRef.current[index] = node
                    },
                    onClick(event: MouseEvent<HTMLButtonElement>) {
                      itemOnClick?.(event)

                      // Activating a menu item dismisses the menu — otherwise
                      // it hangs open over the change the click just made.
                      setOpen(false)
                    }
                  }),
                  active: activeIndex === index
                })
              })}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  )
}

export type DropdownItemProps = PopoverOptionProps

/** A menu row. Shares `PopoverOption` with the listbox components so a menu
 *  item and a select option are the same height, padding and hover treatment.
 *  Forwards its ref because Dropdown registers each item with the keyboard
 *  navigator. */
export const DropdownItem = forwardRef<HTMLButtonElement, DropdownItemProps>((props, ref) => (
  <PopoverOption ref={ref} role='menuitem' {...props} />
))

DropdownItem.displayName = 'DropdownItem'

export default Dropdown
