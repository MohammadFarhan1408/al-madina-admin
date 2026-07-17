'use client'

// Create/edit role dialog. RHF + Zod; permissions grouped by module as
// checkboxes (Dashboard/Products/Categories/Collections/Orders/Customers/
// Users/Coupons/Settings/Reports/Profile).
import { useEffect, useMemo } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import CustomTextField from '@core/components/mui/TextField'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { roleSchema, defaultRoleValues, type RoleFormValues } from '../schema'
import { useCreateRole, useUpdateRole, usePermissions } from '../hooks/useRoles'
import type { Role } from '../types'

type Props = {
  open: boolean
  onClose: () => void
  role?: Role | null
}

const RoleFormDialog = ({ open, onClose, role }: Props) => {
  const { success, error } = useToast()
  const { data: permissions } = usePermissions()
  const createMutation = useCreateRole()
  const updateMutation = useUpdateRole()
  const isEdit = !!role

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: defaultRoleValues
  })

  useEffect(() => {
    if (!open) return

    reset(
      role
        ? {
            name: role.name,
            description: role.description ?? '',
            permissionIds: role.permissionIds.map(p => (typeof p === 'string' ? p : p.id))
          }
        : defaultRoleValues
    )
  }, [open, role, reset])

  const selected = watch('permissionIds')

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof permissions>()

    for (const perm of permissions ?? []) {
      if (!groups.has(perm.module)) groups.set(perm.module, [])
      groups.get(perm.module)!.push(perm)
    }

    return groups
  }, [permissions])

  const togglePermission = (id: string, checked: boolean) => {
    setValue('permissionIds', checked ? [...selected, id] : selected.filter(p => p !== id))
  }

  const onSubmit = async (values: RoleFormValues) => {
    try {
      if (isEdit && role) {
        await updateMutation.mutateAsync({ id: role.id, body: values })
        success('Role updated')
      } else {
        await createMutation.mutateAsync(values)
        success('Role created')
      }

      onClose()
    } catch (err) {
      error(getErrorMessage(err, 'Something went wrong'))
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{isEdit ? 'Edit Role' : 'Add Role'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='flex flex-col gap-5'>
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                required
                label='Name'
                disabled={role?.isSystem}
                error={!!errors.name}
                helperText={errors.name?.message ?? (role?.isSystem ? 'System role names cannot be changed' : undefined)}
              />
            )}
          />
          <Controller
            name='description'
            control={control}
            render={({ field }) => <CustomTextField {...field} fullWidth multiline minRows={2} label='Description' />}
          />

          <Divider />
          <Typography variant='overline' color='text.secondary'>
            Permissions
          </Typography>
          <div className='flex flex-col gap-4'>
            {Array.from(grouped.entries()).map(([module, perms]) => (
              <div key={module} className='flex flex-col gap-1'>
                <Typography variant='subtitle2'>{module}</Typography>
                <FormGroup className='flex flex-row flex-wrap gap-x-4'>
                  {perms?.map(perm => (
                    <FormControlLabel
                      key={perm.id}
                      control={
                        <Checkbox
                          size='small'
                          checked={selected.includes(perm.id)}
                          onChange={e => togglePermission(perm.id, e.target.checked)}
                        />
                      }
                      label={perm.label}
                    />
                  ))}
                </FormGroup>
              </div>
            ))}
          </div>
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

export default RoleFormDialog
