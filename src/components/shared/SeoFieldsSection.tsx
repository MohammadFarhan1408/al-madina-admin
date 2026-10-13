'use client'

// Shared slug/metaTitle/metaDescription/metaKeywords block for the Product,
// Category and Collection forms, with a live search-result preview. RHF-
// agnostic: takes a loosely typed `control` since the three forms have
// different value shapes that all share these four field names.
import { Controller, useWatch } from 'react-hook-form'

import CharCount from '@/components/shared/CharCount'
import Combobox from '@/components/ui/form/Combobox'
import Input from '@/components/ui/form/Input'
import Textarea from '@/components/ui/form/Textarea'

// Roughly what search engines show before truncating; guidance only.
const TITLE_RECOMMENDED = 60
const DESCRIPTION_RECOMMENDED = 160

/** Mirrors the API's slugify, so the hint shows the slug it will generate. */
export const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

type SeoFieldsSectionProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any

  /** Kept for callers that already pass it; the field is watched internally. */
  metaKeywords?: string[]

  /** The name/title the slug is generated from when left blank. */
  sourceValue?: string

  /** What that source is called, for the hint — 'name' | 'title'. */
  sourceFieldLabel?: string

  /** The title and description the storefront actually publishes for this
   *  page, so the preview shows what search engines will get — not what the
   *  fields would ideally produce. */
  preview?: { title: string; description?: string }

  /** One line on how the storefront uses (or ignores) these fields. */
  note?: string

  /** Skip the leading divider + "SEO" label — when the caller already wraps
   *  this in a Card with its own header. */
  bare?: boolean
}

const SeoFieldsSection = ({
  control,
  sourceValue = '',
  sourceFieldLabel = 'name',
  preview,
  note,
  bare = false
}: SeoFieldsSectionProps) => {
  const [slug, metaTitle, metaDescription, metaKeywords] = useWatch({
    control,
    name: ['slug', 'metaTitle', 'metaDescription', 'metaKeywords']
  }) as [string | undefined, string | undefined, string | undefined, string[] | undefined]

  const generatedSlug = slugify(sourceValue)

  return (
    <div className='flex flex-col gap-5'>
      {!bare && (
        <>
          <hr className='border-border' />
          <span className='text-xs font-semibold tracking-widest text-textSecondary uppercase'>SEO</span>
        </>
      )}

      {preview && (
        <figure className='flex flex-col gap-1 rounded-md border border-border bg-surfaceSunken/25 px-4 py-3'>
          <figcaption className='text-2xs font-semibold tracking-[0.06em] text-textMuted uppercase'>
            Search result preview
          </figcaption>
          <p className='truncate text-base leading-6 text-infoDark'>{preview.title || 'Untitled'}</p>
          <p className='line-clamp-2 text-sm leading-5 text-textSecondary'>
            {preview.description || <span className='text-textMuted'>No description yet.</span>}
          </p>
        </figure>
      )}
      {note && (
        <p className='-mt-2 flex items-start gap-1.5 text-xs text-textMuted'>
          <i aria-hidden className='tabler-info-circle mt-px text-[13px]' />
          {note}
        </p>
      )}

      <Controller
        name='slug'
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value ?? ''}
            label='URL slug'
            placeholder={generatedSlug || 'auto-generated'}
            startAdornment={<span className='text-xs text-textMuted'>/</span>}
            helperText={
              slug
                ? 'Lowercase letters, numbers and hyphens.'
                : generatedSlug
                  ? `Leave blank to use “${generatedSlug}”, generated from the ${sourceFieldLabel}.`
                  : `Leave blank to generate it from the ${sourceFieldLabel}.`
            }
          />
        )}
      />
      <Controller
        name='metaTitle'
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value ?? ''}
            label='Meta title'
            helperText={
              <span className='flex flex-1 justify-between gap-3'>
                <span>Optional.</span>
                <CharCount value={metaTitle} recommended={TITLE_RECOMMENDED} />
              </span>
            }
          />
        )}
      />
      <Controller
        name='metaDescription'
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            value={field.value ?? ''}
            rows={3}
            label='Meta description'
            helperText={
              <span className='flex flex-1 justify-between gap-3'>
                <span>Optional — a sentence or two for search results.</span>
                <CharCount value={metaDescription} recommended={DESCRIPTION_RECOMMENDED} />
              </span>
            }
          />
        )}
      />
      <Controller
        name='metaKeywords'
        control={control}
        render={({ field }) => (
          <Combobox
            freeSolo
            label='Meta keywords'
            placeholder='Type a keyword and press Enter'
            options={[]}
            value={metaKeywords ?? []}
            onChange={next => field.onChange(next)}
          />
        )}
      />
    </div>
  )
}

export default SeoFieldsSection
