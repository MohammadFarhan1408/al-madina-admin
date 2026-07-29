'use client'

import type { ReactNode } from 'react'

import classnames from 'classnames'

export type TabItem = {
  value: string
  label: ReactNode
  icon?: ReactNode
}

export type TabsProps = {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}

const Tabs = ({ items, value, onChange, className }: TabsProps) => (
  <div role='tablist' className={classnames('flex items-center gap-1 border-b border-secondary/20', className)}>
    {items.map(item => {
      const active = item.value === value

      return (
        <button
          key={item.value}
          role='tab'
          type='button'
          aria-selected={active}
          onClick={() => onChange(item.value)}
          className={classnames(
            'flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
            active ? 'border-primary text-primaryDark' : 'border-transparent text-textSecondary hover:text-textPrimary'
          )}
        >
          {item.icon}
          {item.label}
        </button>
      )
    })}
  </div>
)

export type TabPanelProps = {
  active: boolean
  children: ReactNode
  className?: string
}

export const TabPanel = ({ active, children, className }: TabPanelProps) => {
  if (!active) return null

  return (
    <div role='tabpanel' className={classnames('pt-4', className)}>
      {children}
    </div>
  )
}

export default Tabs
