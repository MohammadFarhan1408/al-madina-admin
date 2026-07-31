import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'

import classnames from 'classnames'

export type TableProps = HTMLAttributes<HTMLTableElement> & {

  /** Wrapper classes — use to cap height for a vertically scrolling table. */
  containerClassName?: string
}

/** Horizontal overflow is contained here rather than allowed to widen the
 *  page, so a wide table scrolls inside its own card instead of making the
 *  whole document scroll sideways on mobile. */
export const Table = ({ className, containerClassName, children, ...props }: TableProps) => (
  <div className={classnames('w-full overflow-x-auto overscroll-x-contain', containerClassName)}>
    <table className={classnames('w-full border-collapse text-sm', className)} {...props}>
      {children}
    </table>
  </div>
)

export type TableHeadProps = HTMLAttributes<HTMLTableSectionElement> & {

  /** Pin the header while the body scrolls. Needs a height-capped container. */
  sticky?: boolean
}

export const TableHead = ({ sticky = false, className, children, ...props }: TableHeadProps) => (
  <thead
    className={classnames('bg-backgroundChat/55', sticky && 'sticky top-0 z-(--z-sticky) backdrop-blur-sm', className)}
    {...props}
  >
    {children}
  </thead>
)

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>

export const TableBody = ({ className, children, ...props }: TableBodyProps) => (
  <tbody className={classnames('divide-y divide-border', className)} {...props}>
    {children}
  </tbody>
)

export type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  hover?: boolean
  selected?: boolean
}

export const TableRow = ({ hover = false, selected = false, className, children, ...props }: TableRowProps) => (
  <tr
    aria-selected={selected || undefined}
    className={classnames('transition-colors', hover && 'hover:bg-primary/6', selected && 'bg-primary/10', className)}
    {...props}
  >
    {children}
  </tr>
)

export type TableCellAlign = 'left' | 'center' | 'right'

const alignClasses: Record<TableCellAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right'
}

export type SortDirection = 'asc' | 'desc' | false

export type TableHeaderCellProps = Omit<ThHTMLAttributes<HTMLTableCellElement>, 'onClick'> & {
  align?: TableCellAlign

  /** Pass to make the column sortable. The label becomes a real button, so the
   *  column can be sorted from the keyboard — a `<th onClick>` cannot be. */
  onSort?: () => void
  sortDirection?: SortDirection
}

const sortIcon: Record<'asc' | 'desc' | 'none', string> = {
  asc: 'tabler-arrow-up',
  desc: 'tabler-arrow-down',
  none: 'tabler-arrows-sort'
}

/** Column header. Sortable columns render a focusable button and set
 *  `aria-sort`, so assistive tech announces both that the column is sortable
 *  and which way it's currently ordered. */
export const TableHeaderCell = ({
  align = 'left',
  onSort,
  sortDirection = false,
  className,
  children,
  ...props
}: TableHeaderCellProps) => {
  const state: 'asc' | 'desc' | 'none' = sortDirection === false ? 'none' : sortDirection

  return (
    <th
      scope='col'
      aria-sort={
        onSort ? (sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none') : undefined
      }
      className={classnames(
        'border-b border-border px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-textSecondary',
        alignClasses[align],
        className
      )}
      {...props}
    >
      {onSort ? (
        <button
          type='button'
          onClick={onSort}
          className={classnames(
            'group -mx-1.5 inline-flex max-w-full items-center gap-1.5 rounded-xs px-1.5 py-0.5 transition-colors',
            'hover:text-textPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
            sortDirection && 'text-textPrimary',
            align === 'right' && 'flex-row-reverse'
          )}
        >
          <span className='truncate'>{children}</span>
          <i
            aria-hidden
            className={classnames(
              sortIcon[state],
              'shrink-0 text-[14px] transition-opacity',
              sortDirection ? 'text-primaryInk opacity-100' : 'opacity-0 group-hover:opacity-55'
            )}
          />
        </button>
      ) : (
        children
      )}
    </th>
  )
}

export type TableCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  align?: TableCellAlign

  /** Constrain and ellipsise long values instead of letting one description
   *  stretch the column past the viewport. */
  truncate?: boolean
}

export const TableCell = ({ align = 'left', truncate = false, className, children, ...props }: TableCellProps) => (
  <td
    className={classnames(
      'px-4 py-2.5 text-textPrimary',
      alignClasses[align],
      truncate && 'max-w-70 truncate',
      className
    )}
    {...props}
  >
    {children}
  </td>
)

/** Secondary line inside a cell — a customer's email under their name, a SKU
 *  under a product title. Keeps that pattern from being re-styled per view. */
export const TableCellMeta = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={classnames('block truncate text-xs text-textMuted', className)}>{children}</span>
)
