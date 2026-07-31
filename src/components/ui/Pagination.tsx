import classnames from 'classnames'

import IconButton from './IconButton'

export type PaginationProps = {
  page: number
  count: number
  onChange: (page: number) => void

  /** Hide the numbered buttons and show "Page x of y" instead — for tight
   *  toolbars and narrow screens. */
  compact?: boolean
  className?: string
}

// 1-indexed `page`/`count`, windowed around the current page with edge ellipses.
const buildPageList = (page: number, count: number): (number | 'ellipsis')[] => {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)

  const pages = new Set([1, count, page - 1, page, page + 1])
  const sorted = [...pages].filter(p => p >= 1 && p <= count).sort((a, b) => a - b)

  const result: (number | 'ellipsis')[] = []

  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('ellipsis')
    result.push(p)
  })

  return result
}

/** Page navigation. The numbered buttons are hidden below `sm` and replaced by
 *  a "Page x of y" readout, so the control never overflows a phone-width
 *  toolbar — the prev/next arrows stay usable at every size. */
const Pagination = ({ page, count, onChange, compact = false, className }: PaginationProps) => {
  if (count <= 1) return null

  const atStart = page <= 1
  const atEnd = page >= count

  return (
    <nav aria-label='Pagination' className={classnames('flex items-center gap-1', className)}>
      <IconButton size='sm' aria-label='First page' disabled={atStart} onClick={() => onChange(1)}>
        <i className='tabler-chevrons-left' />
      </IconButton>
      <IconButton size='sm' aria-label='Previous page' disabled={atStart} onClick={() => onChange(page - 1)}>
        <i className='tabler-chevron-left' />
      </IconButton>

      <span className={classnames('items-center gap-1', compact ? 'hidden' : 'hidden sm:flex')}>
        {buildPageList(page, count).map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} aria-hidden className='px-1 text-textMuted'>
              …
            </span>
          ) : (
            <button
              key={p}
              type='button'
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onChange(p)}
              className={classnames(
                'inline-flex size-7 items-center justify-center rounded-md text-sm tabular-nums transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2',
                p === page
                  ? 'bg-primary font-semibold text-richBlack'
                  : 'font-medium text-textSecondary hover:bg-actionHover hover:text-textPrimary'
              )}
            >
              {p}
            </button>
          )
        )}
      </span>

      <span
        aria-hidden
        className={classnames('px-2 text-sm tabular-nums text-textSecondary', compact ? 'block' : 'sm:hidden')}
      >
        {`${page} / ${count}`}
      </span>

      <IconButton size='sm' aria-label='Next page' disabled={atEnd} onClick={() => onChange(page + 1)}>
        <i className='tabler-chevron-right' />
      </IconButton>
      <IconButton size='sm' aria-label='Last page' disabled={atEnd} onClick={() => onChange(count)}>
        <i className='tabler-chevrons-right' />
      </IconButton>
    </nav>
  )
}

export default Pagination
