import classnames from 'classnames'

export type PaginationProps = {

  /** 1-indexed current page. */
  page: number

  /** Total number of pages. */
  count: number
  onChange: (page: number) => void
  className?: string
}

/** 1-indexed page list: always the first and last page, the current page and
 *  one neighbour each side, with an ellipsis for each gap. A gap of exactly
 *  one page shows that page instead of an ellipsis — "…" standing in for a
 *  single number saves nothing. Never more than 7 slots, so the control's
 *  width stays stable as you page through. */
export const buildPageList = (page: number, count: number): (number | 'gap-start' | 'gap-end')[] => {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)

  // Keep a window of 3 around the current page, pinned away from the edges so
  // the slot count is constant.
  const start = Math.min(Math.max(page - 1, 3), count - 4)
  const end = start + 2

  return [
    1,
    start === 3 ? 2 : 'gap-start',
    ...Array.from({ length: end - start + 1 }, (_, i) => start + i),
    end === count - 2 ? count - 1 : 'gap-end',
    count
  ]
}

const navButton = classnames(
  'inline-flex h-8 pointer-coarse:h-11 items-center gap-1 rounded-md px-2 text-sm font-medium text-textSecondary transition-colors',
  'hover:bg-actionHover hover:text-textPrimary',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
  'disabled:pointer-events-none disabled:opacity-40'
)

/** Page navigation: Previous / numbered pages / Next. Below `sm` the numbers
 *  collapse to "Page x of y" so the control never overflows a phone — the
 *  Previous/Next buttons stay at every size. */
const Pagination = ({ page, count, onChange, className }: PaginationProps) => {
  if (count <= 1) return null

  const atStart = page <= 1
  const atEnd = page >= count

  return (
    <nav aria-label='Pagination' className={classnames('flex items-center gap-1', className)}>
      <button
        type='button'
        aria-label='Previous page'
        className={navButton}
        disabled={atStart}
        onClick={() => onChange(page - 1)}
      >
        <i aria-hidden className='tabler-chevron-left text-base' />
        <span aria-hidden className='max-sm:hidden'>
          Previous
        </span>
      </button>

      <ol className='hidden items-center gap-1 sm:flex'>
        {buildPageList(page, count).map(p =>
          typeof p === 'number' ? (
            <li key={p}>
              <button
                type='button'
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
                onClick={() => onChange(p)}
                className={classnames(
                  'inline-flex h-8 min-w-8 pointer-coarse:h-11 pointer-coarse:min-w-11 items-center justify-center rounded-md px-1.5 text-sm tabular-nums transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                  p === page
                    ? 'bg-primary font-semibold text-richBlack shadow-xs'
                    : 'font-medium text-textSecondary hover:bg-actionHover hover:text-textPrimary'
                )}
              >
                {p}
              </button>
            </li>
          ) : (
            <li key={p} aria-hidden className='w-6 text-center text-textMuted'>
              …
            </li>
          )
        )}
      </ol>

      <span className='px-1.5 text-sm tabular-nums text-textSecondary sm:hidden'>
        Page {page} of {count}
      </span>

      <button
        type='button'
        aria-label='Next page'
        className={navButton}
        disabled={atEnd}
        onClick={() => onChange(page + 1)}
      >
        <span aria-hidden className='max-sm:hidden'>
          Next
        </span>
        <i aria-hidden className='tabler-chevron-right text-base' />
      </button>
    </nav>
  )
}

export default Pagination
