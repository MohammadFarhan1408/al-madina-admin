'use client'

// Generic server-driven table built on TanStack Table + MUI. Sorting/filtering/
// pagination state is owned by the caller so it can be forwarded to the backend
// (page/limit≤50 per doc §7). This component only renders.

import { type ReactNode } from 'react'

import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState
} from '@tanstack/react-table'

export type DataTableProps<T> = {
  data: T[]
  columns: ColumnDef<T, any>[]
  total: number
  pagination: PaginationState
  onPaginationChange: (updater: PaginationState) => void
  isLoading?: boolean
  emptyMessage?: string
  toolbar?: ReactNode
  pageSizeOptions?: number[]
}

function DataTable<T>({
  data,
  columns,
  total,
  pagination,
  onPaginationChange,
  isLoading = false,
  emptyMessage = 'No records found',
  toolbar,
  pageSizeOptions = [10, 20, 50]
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    manualPagination: true,
    rowCount: total,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <Card>
      {toolbar}
      {isLoading && <LinearProgress />}
      <TableContainer>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell key={header.id} sx={{ whiteSpace: 'nowrap' }}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align='center' sx={{ py: 8 }}>
                  <Typography color='text.secondary'>{isLoading ? 'Loading…' : emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} hover>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component='div'
        count={total}
        page={pagination.pageIndex}
        rowsPerPage={pagination.pageSize}
        rowsPerPageOptions={pageSizeOptions}
        onPageChange={(_, page) => onPaginationChange({ ...pagination, pageIndex: page })}
        onRowsPerPageChange={e =>
          onPaginationChange({ pageIndex: 0, pageSize: parseInt(e.target.value, 10) })
        }
      />
    </Card>
  )
}

export default DataTable
