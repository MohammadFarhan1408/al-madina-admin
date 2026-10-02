'use client'

import type { ReactNode } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import classnames from 'classnames'

export type SidebarNavItem = {
  label: string
  href: string
  icon?: string
}

export type SidebarSection = {
  title?: string
  items: SidebarNavItem[]
}

export type SidebarProps = {
  sections: SidebarSection[]
  logo?: ReactNode

  /** Mobile drawer visibility. Ignored at `lg` and up, where the rail is fixed. */
  open?: boolean

  /** Desktop icon-rail mode. */
  collapsed?: boolean
  onToggleCollapse?: () => void
  onNavigate?: () => void
  onClose?: () => void
}

/** One row geometry for every nav link, so nothing in the rail sits on its own
 *  private grid. 36px tall, icon box fixed at 20px, label always starting at
 *  the same x. */
/** Square control in the rail header — collapse toggle, mobile close. */
const headerButton = classnames(
  'flex size-8 pointer-coarse:size-11 shrink-0 items-center justify-center rounded-lg text-ivoryDim/70',
  'transition-colors duration-150 hover:bg-white/8 hover:text-ivory',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-inset'
)

const row = (collapsed: boolean) =>
  classnames(
    'group relative flex h-9 pointer-coarse:h-11 w-full items-center rounded text-sm transition-[color,background-color] duration-150 ease-out-quart',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-inset',
    collapsed ? 'justify-center px-0' : 'gap-2.5 px-2'
  )

/** Dark obsidian + gold navigation rail — the "semi-dark" half of the brand's
 *  light-content/dark-nav look.
 *
 *  Two independent responsive behaviours:
 *  - below `lg` it's an overlay drawer driven by `open`, and is hidden with
 *    `visibility` when closed so its links can't be reached by Tab from the
 *    page behind it;
 *  - at `lg` and up it's always visible and `collapsed` narrows it to an icon
 *    rail, with the accessible name preserved via `title` + `aria-label`.
 *
 *  Hairlines and hover surfaces are white-based; gold is reserved for the
 *  active state alone, so the accent means one thing. The active item is marked
 *  three ways — a slim gold edge indicator, a raised surface and a weight
 *  change — so it never relies on colour alone, and `aria-current='page'`
 *  states it outright for assistive tech. */
const Sidebar = ({
  sections,
  logo,
  open = false,
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  onClose
}: SidebarProps) => {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`)

  return (
    <aside
      aria-label='Main navigation'
      className={classnames(
        'fixed inset-y-0 left-0 z-(--z-drawer) flex flex-col border-r border-white/8 bg-richBlack text-ivory',
        'transition-[transform,width] duration-200 ease-out-quart',

        // `visibility` rather than `inert`: it also removes the links from the
        // tab order while the drawer is off-screen, but unlike the `inert`
        // attribute it can be scoped to a breakpoint — so the always-visible
        // desktop rail is never accidentally disabled.

        'lg:visible lg:translate-x-0',
        collapsed ? 'w-(--sidebar-width-collapsed)' : 'w-(--sidebar-width)',
        open ? 'visible translate-x-0 shadow-xl' : 'invisible -translate-x-full'
      )}
    >
      <div
        className={classnames(
          'flex h-(--header-height) shrink-0 items-center border-b border-white/8',
          collapsed ? 'justify-center px-2' : 'gap-2 pl-4 pr-2'
        )}
      >
        {!collapsed && <div className='mr-auto flex min-w-0 items-center'>{logo}</div>}

        {/* Collapsed, this button *is* the header: the rail is too narrow for a
            wordmark, and a brand mark there would waste the one slot the user
            needs to get the rail back. */}
        {onToggleCollapse && (
          <button
            type='button'
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            onClick={onToggleCollapse}
            className={classnames(headerButton, 'max-lg:hidden')}
          >
            <i
              className={classnames(
                collapsed ? 'tabler-layout-sidebar-left-expand' : 'tabler-layout-sidebar-left-collapse',
                'text-[20px]'
              )}
            />
          </button>
        )}

        {!collapsed && onClose && (
          <button
            type='button'
            aria-label='Close navigation'
            onClick={onClose}
            className={classnames(headerButton, 'lg:hidden')}
          >
            <i className='tabler-x text-[18px]' />
          </button>
        )}
      </div>

      <nav
        className={classnames(
          'flex-1 overflow-y-auto overflow-x-hidden px-3 py-3',

          // Default UA scrollbars are painted for a light page and read as a
          // bright stripe down a black rail.
          '[scrollbar-color:rgb(255_255_255/0.18)_transparent] [scrollbar-width:thin]'
        )}
      >
        {/* Every group after the first is separated by a rule, in both states —
            collapsed the rule is the only thing left saying where one group
            ends, and expanded it keeps the eyebrow from floating between two
            equally-spaced stacks of rows. */}
        {sections.map((section, i) => (
          <div key={section.title ?? i} className={i > 0 ? 'mt-4 border-t border-white/8 pt-4' : undefined}>
            {section.title && !collapsed && (
              <h2 className='mb-1 px-2 text-2xs font-semibold uppercase tracking-[0.14em] text-ash'>{section.title}</h2>
            )}
            <ul className='flex flex-col gap-px'>
              {section.items.map(item => {
                const active = isActive(item.href)

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      className={classnames(
                        row(collapsed),
                        active
                          ? 'bg-white/8 font-medium text-ivory'
                          : 'font-normal text-ivoryDim/65 hover:bg-white/5 hover:text-ivory'
                      )}
                    >
                      {/* Gold indicator sitting on the row's own left edge, not
                          the rail's — attached to the link it marks instead of
                          stranded against the sidebar border. `top-1/2` +
                          `-translate-y-1/2` centre it on the row; from there it
                          grows out of its own middle, extending up and down at
                          the same time as the route changes. */}
                      <span
                        aria-hidden
                        className={classnames(
                          'absolute left-0 top-1/2 h-4 w-[3px] origin-center -translate-y-1/2 rounded-full bg-primary',
                          'transition-[opacity,transform] duration-300 ease-out-quart',
                          active ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
                        )}
                      />
                      {item.icon && (
                        <i
                          className={classnames(
                            item.icon,
                            'size-5 shrink-0 text-[20px] leading-none transition-colors duration-150',
                            active ? 'text-primary' : 'text-ivoryDim/50 group-hover:text-ivoryDim'
                          )}
                        />
                      )}
                      {!collapsed && <span className='truncate'>{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
