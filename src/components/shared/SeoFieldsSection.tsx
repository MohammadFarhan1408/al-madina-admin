'use client'

// Shared slug/metaTitle/metaDescription/metaKeywords block — was duplicated
// verbatim across the Product/Category/Collection forms. RHF-agnostic: takes
// a `control` typed loosely (`any`) since the three consuming forms have
// different value shapes that all happen to share these four field names.
import { Controller } from 'react-hook-form'

import Input from '@/components/ui/form/Input'
import Textarea from '@/components/ui/form/Textarea'
import Combobox from '@/components/ui/form/Combobox'

type SeoFieldsSectionProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any
  metaKeywords: string[]

  /** What the slug auto-generates from, for the helper label — 'name' | 'title'. */
  sourceFieldLabel?: string

  /** Skip the leading divider + "SEO" label — pass true when the caller already wraps this in a Card with its own header title. */
  bare?: boolean
}

const SeoFieldsSection = ({
  control,
  metaKeywords,
  sourceFieldLabel = 'name',
  bare = false
}: SeoFieldsSectionProps) => (
  <div className='flex flex-col gap-5'>
    {!bare && (
      <>
        <hr className='border-border' />
        <span className='text-xs font-semibold uppercase tracking-widest text-textSecondary'>SEO</span>
      </>
    )}
    <Controller
      name='slug'
      control={control}
      render={({ field }) => <Input {...field} label={`Slug (optional — auto-generated from ${sourceFieldLabel})`} />}
    />
    <Controller
      name='metaTitle'
      control={control}
      render={({ field }) => <Input {...field} label='Meta title (optional)' />}
    />
    <Controller
      name='metaDescription'
      control={control}
      render={({ field }) => <Textarea {...field} rows={2} label='Meta description (optional)' />}
    />
    <Controller
      name='metaKeywords'
      control={control}
      render={({ field }) => (
        <Combobox
          freeSolo
          label='Meta keywords (optional)'
          placeholder='Type a keyword and press Enter'
          options={[]}
          value={metaKeywords ?? []}
          onChange={next => field.onChange(next)}
        />
      )}
    />
  </div>
)

export default SeoFieldsSection
