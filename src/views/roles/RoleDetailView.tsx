'use client'

// Read-only role detail — description, isSystem badge, permissions grouped
// by module as chips (read-only equivalent of the form's checkbox editor).
import { useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DetailSection from '@/components/shared/DetailSection'
import DetailRow from '@/components/shared/DetailRow'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { useRole, useDeleteRole, usePermissions } from '@/features/roles/hooks/useRoles'

type Props = { id: string }

const RoleDetailView = ({ id }: Props) => {
  const router = useRouter()
  const { data: role, isLoading, isError, error } = useRole(id)
  const { data: permissions } = usePermissions()
  const deleteMutation = useDeleteRole()
  const { success, error: toastError } = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const permissionIds = useMemo(
    () => new Set((role?.permissionIds ?? []).map(p => (typeof p === 'string' ? p : p.id))),
    [role]
  )

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof permissions>()

    for (const perm of permissions ?? []) {
      if (!permissionIds.has(perm.id)) continue
      if (!groups.has(perm.module)) groups.set(perm.module, [])
      groups.get(perm.module)!.push(perm)
    }

    return groups
  }, [permissions, permissionIds])

  const handleDelete = async () => {
    if (!role) return

    try {
      await deleteMutation.mutateAsync(role.id)
      success('Role deleted')
      router.push('/roles')
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to delete role'))
      setConfirmDelete(false)
    }
  }

  if (isLoading || !role) {
    return (
      <>
        <Breadcrumbs />
        <PageHeader title='Role' />
        {isError ? (
          <Alert severity='error'>{(error as Error)?.message || 'Failed to load role.'}</Alert>
        ) : (
          <div className='flex justify-center p-8'>
            <CircularProgress />
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <Breadcrumbs extra={[{ label: role.name }]} />
      <PageHeader
        title={role.name}
        subtitle={role.description}
        action={
          <div className='flex items-center gap-3'>
            <Button variant='tonal' color='secondary' onClick={() => router.push('/roles')}>
              Back
            </Button>
            <Button variant='tonal' startIcon={<i className='tabler-edit' />} onClick={() => router.push(`/roles/${id}/edit`)}>
              Edit
            </Button>
            <Tooltip title={role.isSystem ? 'System roles cannot be deleted' : ''}>
              <span>
                <Button
                  variant='tonal'
                  color='error'
                  startIcon={<i className='tabler-trash' />}
                  disabled={role.isSystem}
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </Button>
              </span>
            </Tooltip>
          </div>
        }
      />

      <div className='flex flex-col gap-4'>
        <DetailSection title='Overview'>
          <DetailRow label='System role' value={role.isSystem ? <StatusChip value='system' color='secondary' /> : 'No'} />
          <DetailRow label='Description' value={role.description || '—'} stacked />
        </DetailSection>

        <DetailSection title='Permissions'>
          {grouped.size === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              No permissions assigned.
            </Typography>
          ) : (
            Array.from(grouped.entries()).map(([module, perms]) => (
              <DetailRow
                key={module}
                label={module}
                stacked
                value={
                  <div className='flex flex-wrap gap-2'>
                    {perms?.map(perm => <Chip key={perm.id} variant='tonal' size='small' label={perm.label} />)}
                  </div>
                }
              />
            ))
          )}
        </DetailSection>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title='Delete role'
        description={`Delete "${role.name}"? This cannot be undone.`}
        confirmText='Delete'
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  )
}

export default RoleDetailView
