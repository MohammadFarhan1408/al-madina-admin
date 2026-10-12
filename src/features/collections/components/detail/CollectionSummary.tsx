import classnames from 'classnames'

import CopyValueButton from '@/components/shared/CopyValueButton'
import Fact from '@/components/shared/Fact'
import SubHeading from '@/components/shared/SubHeading'
import { humanize } from '@/libs/format'
import type { Collection, CollectionAccent } from '@/features/collections/types'

const accentSwatch: Record<CollectionAccent, string> = {
  gold: 'bg-accentGold',
  emerald: 'bg-accentEmerald',
  burgundy: 'bg-accentBurgundy'
}

/** The hero's right column: subtitle plus accent, product count, order and slug. */
const CollectionSummary = ({ collection }: { collection: Collection }) => (
  <div className='flex min-w-0 flex-col gap-6'>
    <section aria-labelledby='collection-subtitle' className='flex flex-col gap-2'>
      <SubHeading id='collection-subtitle'>Subtitle</SubHeading>
      {collection.subtitle ? (
        <p className='text-lg leading-7 text-textPrimary'>{collection.subtitle}</p>
      ) : (
        <p className='text-sm text-textMuted'>No subtitle.</p>
      )}
    </section>

    <dl className='grid grid-cols-2 gap-x-6 gap-y-4 rounded-md bg-surfaceSunken/35 px-4 py-3.5 sm:grid-cols-4'>
      <Fact label='Accent' strong>
        <span className='flex items-center gap-2'>
          <span
            aria-hidden
            className={classnames(
              'size-4 shrink-0 rounded-full ring-1 ring-richBlack/15',
              accentSwatch[collection.accent]
            )}
          />
          {humanize(collection.accent)}
        </span>
      </Fact>
      <Fact label='Products' strong>
        <span className='text-xl font-semibold tabular-nums'>{collection.productCount}</span>
      </Fact>
      <Fact label='Sort order' hint='Lower numbers are listed first' strong>
        <span className='text-xl font-semibold tabular-nums'>{collection.sortOrder}</span>
      </Fact>
      <Fact label='URL slug' strong>
        {collection.slug ? (
          <span className='flex items-center gap-1'>
            <span className='min-w-0 truncate font-mono text-xs font-normal'>{collection.slug}</span>
            <CopyValueButton value={collection.slug} label='Slug' />
          </span>
        ) : (
          <span className='text-textMuted'>—</span>
        )}
      </Fact>
    </dl>
  </div>
)

export default CollectionSummary
