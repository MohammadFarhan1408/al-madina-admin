'use client'

// Create / rename a tag. One field, so it's a dialog over the list rather than
// a page of its own. Mount it only while open — each open starts from clean
// state.
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/form/Input'
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/components/ui/Modal'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { tagSchema, defaultTagValues, type TagFormValues } from '../schema'
import { useCreateTag, useUpdateTag } from '../hooks/useTags'
import type { Tag } from '../types'

type Props = {
  /** Omit to create. */
  tag?: Tag
  onClose: () => void
}

const TagFormDialog = ({ tag, onClose }: Props) => {
  const { success, error } = useToast()
  const createMutation = useCreateTag()
  const updateMutation = useUpdateTag()
  const title = tag ? 'Rename tag' : 'Add tag'

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: tag ? { name: tag.name } : defaultTagValues
  })

  const submitting = createMutation.isPending || updateMutation.isPending

  const onSubmit = async (values: TagFormValues) => {
    try {
      if (tag) await updateMutation.mutateAsync({ id: tag.id, body: values })
      else await createMutation.mutateAsync(values)

      success(tag ? 'Tag updated' : 'Tag created')
      onClose()
    } catch (err) {
      error(getErrorMessage(err, 'Something went wrong'))
    }
  }

  return (
    <Modal open onClose={submitting ? () => {} : onClose} size='sm' label={title}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex min-h-0 flex-col'>
        <ModalHeader onClose={submitting ? undefined : onClose}>{title}</ModalHeader>
        <ModalBody>
          <Controller
            name='name'
            control={control}
            render={({ field }) => <Input {...field} autoFocus required label='Name' error={errors.name?.message} />}
          />
        </ModalBody>
        <ModalFooter>
          <Button type='button' variant='outlined' color='secondary' onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type='submit' loading={submitting}>
            {tag ? 'Save' : 'Create'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default TagFormDialog
