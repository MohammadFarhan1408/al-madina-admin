'use client'

// Create/edit (rename) tag dialog. RHF + Zod.
import { useEffect } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
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
  open: boolean
  onClose: () => void
  tag?: Tag | null
}

const TagFormDialog = ({ open, onClose, tag }: Props) => {
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
    if (open) reset(tag ? { name: tag.name } : defaultTagValues)
  }, [open, tag, reset])

  const onSubmit = async (values: TagFormValues) => {
    try {
      if (isEdit && tag) {
        await updateMutation.mutateAsync({ id: tag.id, body: values })
        success('Tag updated')
      } else {
        await createMutation.mutateAsync(values)
        success('Tag created')
      }

      onClose()
    } catch (err) {
      error(getErrorMessage(err, 'Something went wrong'))
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth='xs' fullWidth>
      <DialogTitle>{isEdit ? 'Rename Tag' : 'Add Tag'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='flex flex-col gap-5'>
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <CustomTextField {...field} fullWidth required label='Name' error={!!errors.name} helperText={errors.name?.message} />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button color='secondary' variant='tonal' onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' disabled={submitting}>
            {submitting ? <CircularProgress size={20} color='inherit' /> : isEdit ? 'Save changes' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default TagFormDialog
