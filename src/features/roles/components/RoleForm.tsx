'use client'

// Create/edit role form. RHF + Zod; permissions grouped by module as
// checkboxes (Dashboard/Products/Categories/Collections/Orders/Customers/
// Users/Coupons/Settings/Reports/Profile).
import { useEffect, useMemo } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
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
  role?: Role | null
  onSuccess: (role: Role) => void
  onCancel: () => void
}

const RoleForm = ({ role, onSuccess, onCancel }: Props) => {
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
    reset(
      role
        ? {
            name: role.name,
            description: role.description ?? '',
            permissionIds: role.permissionIds.map(p => (typeof p === 'string' ? p : p.id))
          }
        : defaultRoleValues
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

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

  const toggleModuleAll = (perms: { id: string }[], checked: boolean) => {
    const moduleIds = perms.map(p => p.id)

    setValue(
      'permissionIds',
      checked ? [...new Set([...selected, ...moduleIds])] : selected.filter(p => !moduleIds.includes(p))
    )
  }

  const onSubmit = async (values: RoleFormValues) => {
    try {
      if (isEdit && role) {
        const updated = await updateMutation.mutateAsync({ id: role.id, body: values })

        success('Role updated')
        onSuccess(updated)
      } else {
        const created = await createMutation.mutateAsync(values)

        success('Role created')
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
            {Array.from(grouped.entries()).map(([module, perms]) => {
              const moduleSelectedCount = (perms ?? []).filter(perm => selected.includes(perm.id)).length
              const allSelected = (perms?.length ?? 0) > 0 && moduleSelectedCount === perms?.length
              const someSelected = moduleSelectedCount > 0 && !allSelected

              return (
                <div key={module} className='flex flex-col gap-1'>
                  <div className='flex items-center justify-between'>
                    <Typography variant='subtitle2'>{module}</Typography>
                    <FormControlLabel
                      className='mie-0'
                      control={
                        <Checkbox
                          size='small'
                          checked={allSelected}
                          indeterminate={someSelected}
                          onChange={e => toggleModuleAll(perms ?? [], e.target.checked)}
                        />
                      }
                      label='Select all'
                    />
                  </div>
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
              )
            })}
          </div>

          <Divider />
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

export default RoleForm
