'use client'

import { useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'

import classnames from 'classnames'

import Badge from './Badge'

export type TabItem = {
  value: string
  label: ReactNode
  icon?: ReactNode

  /** Count shown after the label, e.g. pending review totals. */
  count?: number
  disabled?: boolean
}

export type TabsProps = {
  items: TabItem[]
  value: string
  onChange: (value: string) => void

  /** Accessible name for the tab list — say what's being switched. */
  label?: string
  className?: string
}

/** Underlined tab bar implementing the ARIA tabs keyboard contract: only the
 *  selected tab is in the tab order, and Left/Right/Home/End move between tabs
 *  (skipping disabled ones) rather than requiring a Tab press per tab.
 *
 *  Scrolls horizontally rather than wrapping, so a long set of tabs never
 *  reflows into two rows and shifts the panel below it. */
const Tabs = ({ items, value, onChange, label, className }: TabsProps) => {
  const listRef = useRef<HTMLDivElement>(null)

  const move = (from: number, delta: number) => {
    const enabled = items.map((item, i) => ({ item, i })).filter(({ item }) => !item.disabled)
    const position = enabled.findIndex(({ i }) => i === from)

    if (position === -1) return

    const next = enabled[(position + delta + enabled.length) % enabled.length]

    onChange(next.item.value)
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next.i]?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => move(index, 1),
      ArrowLeft: () => move(index, -1),
      Home: () => move(-1, 1),
      End: () => move(items.length, -1)
    }

    const handler = keys[e.key]

    if (!handler) return

    e.preventDefault()
    handler()
  }

  return (
    <div
      ref={listRef}
      role='tablist'
      aria-label={label}
      className={classnames(
        'flex items-center gap-1 overflow-x-auto border-b border-border',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className
      )}
    >
      {items.map((item, index) => {
        const active = item.value === value

        return (
          <button
            key={item.value}
            role='tab'
            type='button'
            aria-selected={active}
            aria-controls={`${item.value}-panel`}
            tabIndex={active ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            onKeyDown={e => handleKeyDown(e, index)}
            className={classnames(
              'relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap',
              'transition-colors duration-150 ease-out-quart',
              'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-t-full after:transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-inset',
              'disabled:pointer-events-none disabled:opacity-45',
              active
                ? 'text-primaryInk after:bg-primaryDark'
                : 'text-textSecondary after:bg-transparent hover:text-textPrimary hover:after:bg-border'
            )}
          >
            {item.icon}
            {item.label}
            {item.count !== undefined && (
              <Badge size='sm' color={active ? 'primary' : 'neutral'}>
                {item.count}
              </Badge>
            )}
          </button>
        )
      })}
    </div>
  )
}

export type TabPanelProps = {
  active: boolean

  /** Ties the panel back to its tab for assistive tech. Pass the tab's value. */
  value?: string
  children: ReactNode
  className?: string
}

export const TabPanel = ({ active, value, children, className }: TabPanelProps) => {
  if (!active) return null

  return (
    <div
      role='tabpanel'
      id={value ? `${value}-panel` : undefined}
      tabIndex={0}
      className={classnames('pt-5 focus-visible:outline-none', className)}
    >
      {children}
    </div>
  )
}

export default Tabs
