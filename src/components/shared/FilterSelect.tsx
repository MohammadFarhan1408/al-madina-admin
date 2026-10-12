'use client'

// Single-choice toolbar filter in a popover — for a secondary dimension with
// too many values for tabs or a segmented control (payment status, category,
// scent family). Searchable automatically once the list is long. The "All"
// row clears the filter, so there is no separate reset per filter.
import { useMemo, useRef, useState, type KeyboardEvent } from 'react'

import classnames from 'classnames'

import { popoverSurface } from '@/components/ui/Popover'

import { FilterPill, useFilterPopover } from './FilterPill'

export type FilterOption<T extends string> = { value: T; label: string; count?: number }

type FilterSelectProps<T extends string> = {

  /** The dimension's name — the pill text and the listbox's accessible name. */
  label: string
  value: T | ''
  onChange: (value: T | '') => void
  options: FilterOption<T>[]

  /** Text for the clearing row, e.g. "All categories". */
  allLabel?: string
  icon?: string

  /** Defaults to true from 8 options up. */
  searchable?: boolean
}

const FilterSelect = <T extends string>({
  label,
  value,
  onChange,
  options,
  allLabel = 'All',
  icon,
  searchable
}: FilterSelectProps<T>) => {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)
  const showSearch = searchable ?? options.length >= 8

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = q ? options.filter(o => o.label.toLowerCase().includes(q)) : options

    return [{ value: '' as const, label: allLabel }, ...matches] as (
      | FilterOption<T>
      | { value: ''; label: string; count?: number }
    )[]
  }, [options, query, allLabel])

  const popover = useFilterPopover({
    onOpen: () => {
      setQuery('')
      setActiveIndex(
        Math.max(
          0,
          [{ value: '' }, ...options].findIndex(o => o.value === value)
        )
      )
    }
  })

  const selected = options.find(o => o.value === value)

  const choose = (next: T | '') => {
    onChange(next)
    popover.setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const move = (delta: number) => {
      e.preventDefault()
      const next = (activeIndex + delta + rows.length) % rows.length

      setActiveIndex(next)
      listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' })
    }

    if (e.key === 'ArrowDown') move(1)
    else if (e.key === 'ArrowUp') move(-1)
    else if (e.key === 'Enter' && rows[activeIndex]) {
      e.preventDefault()
      choose(rows[activeIndex].value as T | '')
    }
  }

  const listId = `filter-${label.replace(/\s+/g, '-').toLowerCase()}-list`

  return (
    <>
      <FilterPill
        label={label}
        valueLabel={selected?.label}
        icon={icon}
        open={popover.open}
        {...popover.reference({ onKeyDown: popover.open ? onKeyDown : undefined })}
      />

      {popover.open && (
        <div {...popover.floating(classnames(popoverSurface, 'flex w-64 flex-col p-0'))}>
          {showSearch && (
            <div className='border-b border-border p-1.5'>
              <input
                autoFocus
                value={query}
                onChange={e => {
                  setQuery(e.target.value)
                  setActiveIndex(0)
                }}
                onKeyDown={onKeyDown}
                placeholder={`Search ${label.toLowerCase()}…`}
                aria-label={`Search ${label.toLowerCase()}`}
                aria-controls={listId}
                aria-activedescendant={`${listId}-${activeIndex}`}
                className='h-9 w-full rounded-md bg-surfaceSunken/40 px-2.5 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary/35'
              />
            </div>
          )}
          <ul
            ref={listRef}
            id={listId}
            role='listbox'
            aria-label={label}
            tabIndex={showSearch ? -1 : 0}
            autoFocus={!showSearch}
            aria-activedescendant={showSearch ? undefined : `${listId}-${activeIndex}`}
            onKeyDown={showSearch ? undefined : onKeyDown}
            className='flex max-h-72 flex-col overflow-y-auto p-1 focus:outline-none'
          >
            {rows.length === 1 && query && (
              <li className='px-2.5 py-2 text-sm text-textMuted'>
                No {label.toLowerCase()} match “{query}”
              </li>
            )}
            {rows.map((row, i) => {
              const isSelected = row.value === value

              return (
                <li
                  key={row.value || '__all'}
                  id={`${listId}-${i}`}
                  role='option'
                  aria-selected={isSelected}
                  onClick={() => choose(row.value as T | '')}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={classnames(
                    'flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 pointer-coarse:min-h-11 text-sm',
                    i === activeIndex ? 'bg-primary/14' : isSelected && 'bg-primary/8',
                    isSelected ? 'font-medium text-textPrimary' : 'text-textPrimary',
                    i === 0 && rows.length > 1 && 'mb-1'
                  )}
                >
                  <i
                    aria-hidden
                    className={classnames(
                      'tabler-check shrink-0 text-[16px] text-primaryInk',
                      !isSelected && 'opacity-0'
                    )}
                  />
                  <span className={classnames('min-w-0 flex-1 truncate', i === 0 && 'text-textSecondary')}>
                    {row.label}
                  </span>
                  {row.count !== undefined && <span className='text-xs tabular-nums text-textMuted'>{row.count}</span>}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </>
  )
}

export default FilterSelect
