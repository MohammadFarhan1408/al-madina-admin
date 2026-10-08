'use client'

// ⌘K / Ctrl+K palette: jump to any page, start a "new …" action, or find a
// product, order or customer without knowing which list it lives in.
// Combobox pattern: focus stays in the input, arrow keys move the active
// option (aria-activedescendant), Enter opens it, Esc closes.
import { useEffect, useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import classnames from 'classnames'

import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'
import { useAuth } from '@/contexts/AuthContext'
import { visibleNav } from '@/data/navigation/sidebarNavData'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { formatCurrency, humanize } from '@/libs/format'
import { useAdminSearch } from '@/features/search/hooks/useAdminSearch'

type Option = { id: string; group: string; label: string; hint?: string; icon: string; href: string }

const NEW_ACTIONS: Option[] = [
  { id: 'new-product', group: 'Actions', label: 'New product', icon: 'tabler-plus', href: '/products/new' },
  { id: 'new-category', group: 'Actions', label: 'New category', icon: 'tabler-plus', href: '/categories/new' },
  { id: 'new-collection', group: 'Actions', label: 'New collection', icon: 'tabler-plus', href: '/collections/new' },
  { id: 'new-coupon', group: 'Actions', label: 'New coupon', icon: 'tabler-plus', href: '/coupons/new' }
]

const matches = (o: Option, q: string) => o.label.toLowerCase().includes(q.toLowerCase())

const PaletteBody = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)
  const debounced = useDebouncedValue(query.trim(), 250)
  const { data, isFetching } = useAdminSearch(debounced)

  const pages = useMemo<Option[]>(
    () =>
      visibleNav(user?.role === 'admin').flatMap(section =>
        section.items.map(item => ({
          id: `page-${item.href}`,
          group: 'Go to',
          label: item.label,
          icon: item.icon ?? 'tabler-arrow-right',
          href: item.href
        }))
      ),
    [user?.role]
  )

  const options = useMemo<Option[]>(() => {
    const q = query.trim()
    const local = [...pages, ...NEW_ACTIONS].filter(o => !q || matches(o, q))

    const found: Option[] =
      debounced.length >= 2 && data
        ? [
            ...data.products.map(p => ({
              id: `product-${p.id}`,
              group: 'Products',
              label: p.name,
              hint: `by ${p.brand}${p.inStock ? '' : ' · out of stock'}`,
              icon: 'tabler-package',
              href: `/products/${p.id}`
            })),
            ...data.orders.map(o => ({
              id: `order-${o.id}`,
              group: 'Orders',
              label: o.reference,
              hint: [o.customer, humanize(o.status), formatCurrency(o.total, o.currency)].filter(Boolean).join(' · '),
              icon: 'tabler-shopping-cart',
              href: `/orders/${o.id}`
            })),
            ...data.customers.map(c => ({
              id: `customer-${c.id}`,
              group: 'Customers',
              label: c.fullName,
              hint: c.email,
              icon: 'tabler-user',
              href: `/customers/${c.id}`
            }))
          ]
        : []

    return [...found, ...local]
  }, [pages, query, debounced, data])

  // A new result set starts at the top; keep the highlighted row in view.
  useEffect(() => setActive(0), [options.length, query])
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const go = (o: Option | undefined) => {
    if (!o) return
    onClose()
    router.push(o.href)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()

      if (options.length) setActive(i => (i + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      go(options[active])
    }
  }

  const searching = debounced.length >= 2 && isFetching

  return (
    <>
      <div className='flex items-center gap-3 border-b border-border px-4'>
        <i aria-hidden className='tabler-search text-[18px] text-textMuted' />
        <input
          autoFocus
          role='combobox'
          aria-expanded
          aria-controls='palette-list'
          aria-activedescendant={options[active] ? `palette-opt-${options[active].id}` : undefined}
          aria-label='Search pages, products, orders and customers'
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder='Search products, orders, customers, pages…'
          className='h-14 min-w-0 flex-1 bg-transparent text-sm text-textPrimary placeholder:text-textMuted focus:outline-none'
        />
        {searching && <Spinner size='sm' label='Searching' />}
      </div>

      <ul id='palette-list' ref={listRef} role='listbox' className='max-h-[60dvh] overflow-y-auto p-2'>
        {options.length === 0 && (
          <li className='px-3 py-8 text-center text-sm text-textMuted'>
            {searching ? 'Searching…' : `No results for “${query.trim()}”`}
          </li>
        )}
        {options.map((o, i) => (
          <li key={o.id} role='presentation'>
            {(i === 0 || options[i - 1].group !== o.group) && (
              <div className='px-3 pb-1 pt-3 text-2xs font-semibold uppercase tracking-[0.12em] text-textMuted'>
                {o.group}
              </div>
            )}
            <div
              id={`palette-opt-${o.id}`}
              role='option'
              aria-selected={i === active}
              data-index={i}
              onMouseMove={() => setActive(i)}
              onClick={() => go(o)}
              className={classnames(
                'flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-3 py-2 pointer-coarse:min-h-11',
                i === active && 'bg-primary/14'
              )}
            >
              <i aria-hidden className={classnames(o.icon, 'shrink-0 text-[18px] text-textSecondary')} />
              <span className='min-w-0 flex-1 truncate text-sm text-textPrimary'>{o.label}</span>
              {o.hint && <span className='shrink-0 truncate text-xs text-textMuted max-sm:hidden'>{o.hint}</span>}
            </div>
          </li>
        ))}
      </ul>

      <div className='flex items-center gap-4 border-t border-border px-4 py-2 text-xs text-textMuted max-sm:hidden'>
        <span>↑↓ navigate</span>
        <span>↵ open</span>
        <span>esc close</span>
      </div>
    </>
  )
}

type CommandPaletteProps = { open: boolean; onClose: () => void }

/** Body is mounted only while open, so every opening starts from an empty query. */
const CommandPalette = ({ open, onClose }: CommandPaletteProps) => (
  <Modal open={open} onClose={onClose} size='md' label='Search' className='mt-[10dvh]! mb-auto!'>
    {open && <PaletteBody onClose={onClose} />}
  </Modal>
)

export default CommandPalette
