'use client'

// Shared slug/metaTitle/metaDescription/metaKeywords block — was duplicated
// verbatim across the Product/Category/Collection forms. RHF-agnostic: takes
// a `control` typed loosely (`any`) since the three consuming forms have
// different value shapes that all happen to share these four field names.
import { Controller } from 'react-hook-form'

import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'

import CustomTextField from '@core/components/mui/TextField'

type SeoFieldsSectionProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any
  metaKeywords: string[]

  /** What the slug auto-generates from, for the helper label — 'name' | 'title'. */
  sourceFieldLabel?: string

  /** Skip the leading Divider + "SEO" label — pass true when the caller already wraps this in a Card with its own CardHeader title. */
  bare?: boolean
}

const SeoFieldsSection = ({ control, metaKeywords, sourceFieldLabel = 'name', bare = false }: SeoFieldsSectionProps) => (
  <div className='flex flex-col gap-5'>
    {!bare && (
      <>
        <Divider />
        <Typography variant='overline' color='text.secondary'>
          SEO
        </Typography>
      </>
    )}
    <Controller
      name='slug'
      control={control}
      render={({ field }) => (
        <CustomTextField {...field} fullWidth label={`Slug (optional — auto-generated from ${sourceFieldLabel})`} />
      )}
    />
    <Controller
      name='metaTitle'
      control={control}
      render={({ field }) => <CustomTextField {...field} fullWidth label='Meta title (optional)' />}
    />
    <Controller
      name='metaDescription'
      control={control}
      render={({ field }) => (
        <CustomTextField {...field} fullWidth multiline minRows={2} label='Meta description (optional)' />
      )}
    />
    <Controller
      name='metaKeywords'
      control={control}
      render={({ field }) => (
        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={metaKeywords ?? []}
          onChange={(_, next) => field.onChange(next)}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => {
              const { key, ...rest } = getTagProps({ index })

              return <Chip key={key} variant='tonal' label={option} size='small' {...rest} />
            })
          }
          renderInput={params => (
            <CustomTextField {...params} label='Meta keywords (optional)' placeholder='Type a keyword and press Enter' />
          )}
        />
      )}
    />
  </div>
)

export default SeoFieldsSection
