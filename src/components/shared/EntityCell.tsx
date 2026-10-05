import classnames from 'classnames'

import { getInitials } from '@/utils/getInitials'

type EntityCellProps = {
  name: string
  subtitle?: string
  image?: string | null
  round?: boolean
  onClick?: () => void
}

/** Thumbnail + name + subtitle for a table or card row. Falls back to initials
 *  when there is no image, so a missing URL never renders a broken <img>. */
const EntityCell = ({ name, subtitle, image, round = false, onClick }: EntityCellProps) => (
  <div
    className={classnames('flex min-w-0 items-center gap-3', onClick && 'cursor-pointer')}
    onClick={onClick}
  >
    {image ? (
      <img src={image} alt='' className={classnames('size-10 shrink-0 object-cover', round ? 'rounded-full' : 'rounded-md')} />
    ) : (
      <span
        aria-hidden
        className={classnames(
          'flex size-10 shrink-0 items-center justify-center bg-secondary/15 text-sm font-medium text-secondaryDark',
          round ? 'rounded-full' : 'rounded-md'
        )}
      >
        {getInitials(name).slice(0, 2).toUpperCase()}
      </span>
    )}
    <div className='flex min-w-0 flex-col'>
      <span className='truncate text-sm font-medium'>{name}</span>
      {subtitle && <span className='truncate text-xs text-textSecondary'>{subtitle}</span>}
    </div>
  </div>
)

export default EntityCell
