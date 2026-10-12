// The subtle ID / created / updated line under a detail page's title.
import { formatDate } from '@/libs/format'

import CopyValueButton from './CopyValueButton'

type RecordMetaProps = {
  id: string

  /** Noun for the copy button: "Product ID". */
  idLabel: string
  createdAt?: string
  updatedAt?: string
}

const RecordMeta = ({ id, idLabel, createdAt, updatedAt }: RecordMetaProps) => (
  <dl className='-mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-textMuted'>
    <div className='flex items-center gap-1'>
      <dt>ID</dt>
      <dd className='flex items-center gap-0.5 font-mono text-textSecondary'>
        <span className='max-w-48 truncate' title={id}>
          {id}
        </span>
        <CopyValueButton value={id} label={idLabel} />
      </dd>
    </div>
    {createdAt && (
      <div className='flex items-center gap-1'>
        <dt>Created</dt>
        <dd className='text-textSecondary'>{formatDate(createdAt)}</dd>
      </div>
    )}
    {updatedAt && (
      <div className='flex items-center gap-1'>
        <dt>Updated</dt>
        <dd className='text-textSecondary'>{formatDate(updatedAt)}</dd>
      </div>
    )}
  </dl>
)

export default RecordMeta
