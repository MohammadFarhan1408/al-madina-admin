'use client'

// Roles & Permissions management — list roles, edit permission assignment,
// create/delete (system roles protected from deletion). Informational only —
// existing route authorization still runs on the `role` enum (see AGENTS.md).
import { useMemo, useState } from 'react'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import type { ColumnDef } from '@tanstack/react-table'

import PageHeader from '@/components/shared/PageHeader'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import DataTable from '@/components/shared/DataTable'
import StatusChip from '@/components/shared/StatusChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { useRoles, useDeleteRole } from '@/features/roles/hooks/useRoles'
import RoleFormDialog from '@/features/roles/components/RoleFormDialog'
import type { Role } from '@/features/roles/types'

const RolesView = () => {
  const { data: roles, isLoading, isError, error } = useRoles()
  const deleteMutation = useDeleteRole()
  const { success, error: toastError } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [toDelete, setToDelete] = useState<Role | null>(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (role: Role) => {
    setEditing(role)
    setFormOpen(true)
  }

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
          <div className='flex items-center gap-2'>
            <Typography variant='subtitle2'>{row.original.name}</Typography>
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
            <IconButton size='small' aria-label={`Edit ${row.original.name}`} onClick={() => openEdit(row.original)}>
              <i className='tabler-edit' />
            </IconButton>
            <Tooltip title={row.original.isSystem ? 'System roles cannot be deleted' : ''}>
              <span>
                <IconButton
                  size='small'
                  color='error'
                  aria-label={`Delete ${row.original.name}`}
                  disabled={row.original.isSystem}
                  onClick={() => setToDelete(row.original)}
                >
                  <i className='tabler-trash' />
                </IconButton>
              </span>
            </Tooltip>
          </div>
        )
      }
    ],
    []
  )

  return (
    <>
      <Breadcrumbs />
      <PageHeader
        title='Roles & Permissions'
        subtitle='Manage admin role definitions and their permission sets'
        action={
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={openCreate}>
            Add Role
          </Button>
        }
      />

      {isError && <Alert severity='error' className='mbe-4'>{(error as Error)?.message || 'Failed to load roles.'}</Alert>}

      <DataTable manualPagination={false} data={roles ?? []} columns={columns} isLoading={isLoading} emptyMessage='No roles yet.' />

      <RoleFormDialog open={formOpen} onClose={() => setFormOpen(false)} role={editing} />
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
