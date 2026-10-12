import SubHeading from '@/components/shared/SubHeading'
import Badge from '@/components/ui/Badge'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import type { Tag } from '@/features/tags/types'
import type { Product } from '@/features/products/types'

const MERCHANDISING_FLAGS: {
  key: 'isFeatured' | 'isNewArrival' | 'isBestSeller' | 'isSignature' | 'isSeasonal'
  label: string
  icon: string
}[] = [
  { key: 'isFeatured', label: 'Featured', icon: 'tabler-star' },
  { key: 'isNewArrival', label: 'New arrival', icon: 'tabler-sparkles' },
  { key: 'isBestSeller', label: 'Best seller', icon: 'tabler-trophy' },
  { key: 'isSignature', label: 'Signature', icon: 'tabler-signature' },
  { key: 'isSeasonal', label: 'Seasonal', icon: 'tabler-leaf' }
]

const Empty = ({ children }: { children: string }) => <p className='text-sm text-textMuted'>{children}</p>

/** The product's tags and which storefront shelves it's pinned to. */
const ProductMerchandising = ({ product, tags }: { product: Product; tags: Tag[] }) => {
  const activeFlags = MERCHANDISING_FLAGS.filter(flag => product[flag.key])

  return (
    <Card>
      <CardHeader title='Tags & merchandising' />
      <CardBody className='flex flex-col gap-5'>
        <section aria-labelledby='product-tags' className='flex flex-col gap-2'>
          <SubHeading id='product-tags'>Tags</SubHeading>
          {tags.length ? (
            <ul className='flex flex-wrap gap-1.5'>
              {tags.map(tag => (
                <li key={tag.id}>
                  <Badge color='neutral'>{tag.name}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No tags</Empty>
          )}
        </section>

        <section aria-labelledby='product-placement' className='flex flex-col gap-2'>
          <SubHeading id='product-placement'>Storefront placement</SubHeading>
          {activeFlags.length ? (
            <ul className='flex flex-wrap gap-1.5'>
              {activeFlags.map(flag => (
                <li key={flag.key}>
                  <Badge color='primary'>
                    <span className='flex items-center gap-1'>
                      <i aria-hidden className={flag.icon} />
                      {flag.label}
                    </span>
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No merchandising flags set</Empty>
          )}
        </section>
      </CardBody>
    </Card>
  )
}

export default ProductMerchandising
