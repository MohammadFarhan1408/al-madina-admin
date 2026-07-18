'use client'

// Create/edit (rename) tag form. RHF + Zod.
import { useEffect } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import CustomTextField from '@core/components/mui/TextField'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { tagSchema, defaultTagValues, type TagFormValues } from '../schema'
import { useCreateTag, useUpdateTag } from '../hooks/useTags'
import type { Tag } from '../types'

type Props = {
  tag?: Tag | null
  onSuccess: (tag: Tag) => void
  onCancel: () => void
}

const TagForm = ({ tag, onSuccess, onCancel }: Props) => {
  const { success, error } = useToast()
  const createMutation = useCreateTag()
  const updateMutation = useUpdateTag()
  const isEdit = !!tag

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: defaultTagValues
  })

  useEffect(() => {
    reset(tag ? { name: tag.name } : defaultTagValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag])

  const onSubmit = async (values: TagFormValues) => {
    try {
      if (isEdit && tag) {
        const updated = await updateMutation.mutateAsync({ id: tag.id, body: values })

        success('Tag updated')
        onSuccess(updated)
      } else {
        const created = await createMutation.mutateAsync(values)

        success('Tag created')
        onSuccess(created)
      }
    } catch (err) {
      error(getErrorMessage(err, 'Something went wrong'))
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <CustomTextField {...field} fullWidth required label='Name' error={!!errors.name} helperText={errors.name?.message} />
            )}
          />

          <div className='flex items-center justify-end gap-4'>
            <Button color='secondary' variant='tonal' onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type='submit' variant='contained' disabled={submitting}>
              {submitting ? <CircularProgress size={20} color='inherit' /> : isEdit ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default TagForm
