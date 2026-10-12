// Read-only SEO panel for detail pages (products, categories, collections).
// Stacked label-above-value pairs: it usually sits in a narrow side column,
// where side-by-side pairs would strand values across a gap.
import type { ReactNode } from 'react'

import Badge from '@/components/ui/Badge'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'

import CopyValueButton from './CopyValueButton'

type SeoCardProps = {

  /** Omit when the page already shows the slug elsewhere. */
  slug?: string
  showSlug?: boolean
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  className?: string
}

const Field = ({ label, children, action }: { label: string; children: ReactNode; action?: ReactNode }) => (
  <div className='flex min-w-0 flex-col gap-1'>
    <dt className='flex min-h-8 items-center justify-between gap-2 text-xs text-textMuted'>
      {label}
      {action}
    </dt>
    <dd className='min-w-0 text-sm text-textPrimary wrap-break-word'>{children}</dd>
  </div>
)

const Empty = () => <span className='text-textMuted'>—</span>

const SeoCard = ({ slug, showSlug = true, metaTitle, metaDescription, metaKeywords, className }: SeoCardProps) => {
  const hasSeo = Boolean((showSlug && slug) || metaTitle || metaDescription || metaKeywords?.length)

  return (
    <Card className={className}>
      <CardHeader title='SEO' description={hasSeo ? undefined : 'No SEO fields set'} />
      {hasSeo && (
        <CardBody>
          <dl className='flex flex-col gap-3'>
            {showSlug && (
              <Field label='URL slug' action={slug ? <CopyValueButton value={slug} label='Slug' /> : undefined}>
                {slug ? <span className='font-mono text-xs'>{slug}</span> : <Empty />}
              </Field>
            )}
            <Field label='Meta title'>{metaTitle || <Empty />}</Field>
            <Field label='Meta description'>
              {metaDescription ? <span className='leading-6'>{metaDescription}</span> : <Empty />}
            </Field>
            <Field label='Meta keywords'>
              {metaKeywords?.length ? (
                <ul className='flex flex-wrap gap-1.5 pt-0.5'>
                  {metaKeywords.map((keyword, i) => (
                    <li key={`${keyword}-${i}`}>
                      <Badge size='sm' color='neutral' variant='outlined'>
                        {keyword}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty />
              )}
            </Field>
          </dl>
        </CardBody>
      )}
    </Card>
  )
}

export default SeoCard
