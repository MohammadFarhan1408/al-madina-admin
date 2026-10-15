import CopyValueButton from '@/components/shared/CopyValueButton'
import Fact from '@/components/shared/Fact'
import SubHeading from '@/components/shared/SubHeading'
import type { Category } from '@/features/categories/types'

/** The hero's right column: tagline, storefront facts and a delete caveat. */
const CategorySummary = ({ category }: { category: Category }) => (
  <div className='flex min-w-0 flex-col gap-6'>
    <section aria-labelledby='category-tagline' className='flex flex-col gap-2'>
      <SubHeading id='category-tagline'>Tagline</SubHeading>
      {category.tagline ? (
        <p className='text-lg leading-7 text-textPrimary'>{category.tagline}</p>
      ) : (
        <p className='text-sm text-textMuted'>No tagline.</p>
      )}
    </section>

    <dl className='grid grid-cols-1 gap-x-6 gap-y-4 rounded-md bg-surfaceSunken/35 px-4 py-3.5 sm:grid-cols-3'>
      <Fact label='Products' strong>
        <span className='text-xl font-semibold tabular-nums'>{category.productCount}</span>
      </Fact>
      <Fact label='Sort order' hint='Lower numbers are listed first' strong>
        <span className='text-xl font-semibold tabular-nums'>{category.sortOrder}</span>
      </Fact>
      <Fact label='URL slug' strong>
        {category.slug ? (
          <span className='flex items-center gap-1'>
            <span className='min-w-0 truncate font-mono text-xs font-normal'>{category.slug}</span>
            <CopyValueButton value={category.slug} label='Slug' />
          </span>
        ) : (
          <span className='text-textMuted'>—</span>
        )}
      </Fact>
    </dl>

    {category.productCount > 0 && (
      <p className='flex items-start gap-2 text-xs text-textMuted'>
        <i aria-hidden className='tabler-info-circle mt-px text-sm' />
        Deleting this category leaves its products without a category — reassign them first.
      </p>
    )}
  </div>
)

export default CategorySummary
