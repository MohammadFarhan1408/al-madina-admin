'use client'

// Roles & Permissions management — list roles, navigates to dedicated
// Create/Detail/Edit pages (system roles protected from deletion).
// Informational only — existing route authorization still runs on the
// `role` enum (see AGENTS.md).
import { useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { ColumnDef } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import RowActions from '@/components/shared/RowActions'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { useRoles, useDeleteRole } from '@/features/roles/hooks/useRoles'
import type { Role } from '@/features/roles/types'

const RolesView = () => {
  const router = useRouter()
  const { data: roles, isLoading, isError, error } = useRoles()
  const deleteMutation = useDeleteRole()
  const { success, error: toastError } = useToast()

  const [toDelete, setToDelete] = useState<Role | null>(null)

  const confirmDelete = async () => {
    if (!toDelete) return

    try {
      await deleteMutation.mutateAsync(toDelete.id)
      success('Role deleted')
      setToDelete(null)
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to delete role'))
    }
  }

  const columns = useMemo<ColumnDef<Role, any>[]>(
    () => [
      {
        header: 'Role',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className='flex cursor-pointer items-center gap-2' onClick={() => router.push(`/roles/${row.original.id}`)}>
            <span className='text-sm font-medium'>{row.original.name}</span>
            {row.original.isSystem && <StatusChip value='system' color='secondary' />}
          </div>
        )
      },
      {
        header: 'Description',
        accessorKey: 'description',
        enableSorting: false,
        cell: ({ getValue }) => (getValue() as string) || '—'
      },
      {
        header: 'Permissions',
        meta: { align: 'right' },
        enableSorting: false,
        cell: ({ row }) => row.original.permissionIds.length
      },
      {
        header: 'Actions',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className='flex items-center justify-end'>
            <button
              type='button'
              aria-label={`View ${row.original.name}`}
              onClick={() => router.push(`/roles/${row.original.id}`)}
              className='rounded-md p-1.5 text-textSecondary hover:bg-primary/10'
            >
              <i className='tabler-eye' />
            </button>
            <RowActions
              options={[
                { text: 'Edit', icon: 'tabler-edit', onClick: () => router.push(`/roles/${row.original.id}/edit`) },
                {
                  text: 'Delete',
                  icon: 'tabler-trash',
                  danger: true,
                  disabled: row.original.isSystem,
                  onClick: () => setToDelete(row.original)
                }
              ]}
            />
          </div>
        )
      }
    ],
    [router]
  )

  return (
    <>
      <Breadcrumbs />
      <PageHeader
        title='Roles & Permissions'
        subtitle='Manage admin role definitions and their permission sets'
        action={
          <Button startIcon={<i className='tabler-plus' />} onClick={() => router.push('/roles/new')}>
            Add Role
          </Button>
        }
      />

      {isError && (
        <Alert severity='error' className='mb-4'>
          {(error as Error)?.message || 'Failed to load roles.'}
        </Alert>
      )}

      <DataTable manualPagination={false} data={roles ?? []} columns={columns} isLoading={isLoading} emptyMessage='No roles yet.' />

      <ConfirmDialog
        open={!!toDelete}
        title='Delete role'
        description={`Delete "${toDelete?.name}"? This cannot be undone.`}
        confirmText='Delete'
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}

export default RolesView
