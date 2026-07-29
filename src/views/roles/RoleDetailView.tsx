'use client'

// Read-only role detail — description, isSystem badge, permissions grouped
// by module as chips (read-only equivalent of the form's checkbox editor).
import { useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DetailSection from '@/components/shared/DetailSection'
import DetailRow from '@/components/shared/DetailRow'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import QueryState from '@/components/shared/QueryState'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
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
        <QueryState isError={isError} error={error} fallbackMessage='Failed to load role.' />
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
            <Button variant='outlined' color='secondary' onClick={() => router.push('/roles')}>
              Back
            </Button>
            <Button variant='outlined' startIcon={<i className='tabler-edit' />} onClick={() => router.push(`/roles/${id}/edit`)}>
              Edit
            </Button>
            <Button
              variant='outlined'
              color='error'
              startIcon={<i className='tabler-trash' />}
              disabled={role.isSystem}
              title={role.isSystem ? 'System roles cannot be deleted' : undefined}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
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
            <p className='text-sm text-textSecondary'>No permissions assigned.</p>
          ) : (
            Array.from(grouped.entries()).map(([module, perms]) => (
              <DetailRow
                key={module}
                label={module}
                stacked
                value={
                  <div className='flex flex-wrap gap-2'>
                    {perms?.map(perm => (
                      <Badge key={perm.id} color='secondary'>
                        {perm.label}
                      </Badge>
                    ))}
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
