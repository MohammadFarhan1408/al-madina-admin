import classnames from 'classnames'

export type PaginationProps = {
  page: number
  count: number
  onChange: (page: number) => void
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

const navButtonClasses =
  'inline-flex size-8 items-center justify-center rounded-md text-sm text-textPrimary hover:bg-primary/10 disabled:opacity-40 disabled:pointer-events-none'

const Pagination = ({ page, count, onChange, className }: PaginationProps) => {
  if (count <= 1) return null

  return (
    <nav aria-label='Pagination' className={classnames('flex items-center gap-1', className)}>
      <button type='button' aria-label='First page' disabled={page === 1} onClick={() => onChange(1)} className={navButtonClasses}>
        <i className='tabler-chevrons-left text-base' />
      </button>
      <button
        type='button'
        aria-label='Previous page'
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className={navButtonClasses}
      >
        <i className='tabler-chevron-left text-base' />
      </button>
      {buildPageList(page, count).map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className='px-1 text-textDisabled'>
            …
          </span>
        ) : (
          <button
            key={p}
            type='button'
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
            className={classnames(
              'inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors',
              p === page ? 'bg-primary text-black' : 'text-textPrimary hover:bg-primary/10'
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        type='button'
        aria-label='Next page'
        disabled={page === count}
        onClick={() => onChange(page + 1)}
        className={navButtonClasses}
      >
        <i className='tabler-chevron-right text-base' />
      </button>
      <button
        type='button'
        aria-label='Last page'
        disabled={page === count}
        onClick={() => onChange(count)}
        className={navButtonClasses}
      >
        <i className='tabler-chevrons-right text-base' />
      </button>
    </nav>
  )
}

export default Pagination
