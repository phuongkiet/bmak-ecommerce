import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import type { User } from '@/models/User'

// Mock data - sẽ thay thế bằng API sau
const mockCustomers: User[] = []

const AdminCustomers = () => {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Tên khách hàng',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.avatar ? (
              <img
                src={row.original.avatar}
                alt={row.original.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                {row.original.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-gray-900">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-sm text-gray-900">{row.original.email}</span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Số điện thoại',
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">{row.original.phone || 'N/A'}</span>
        ),
      },
      {
        id: 'totalOrders',
        header: 'Tổng đơn hàng',
        cell: () => <span className="text-sm text-gray-500">0</span>,
      },
      {
        accessorKey: 'createdAt',
        header: 'Ngày đăng ký',
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">
            {row.original.createdAt
              ? new Date(row.original.createdAt).toLocaleDateString('vi-VN')
              : 'N/A'}
          </span>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: mockCustomers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Quản lý khách hàng</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none flex items-center gap-2'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: ' ↑',
                            desc: ' ↓',
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                    Chưa có khách hàng nào
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {table.getRowModel().rows.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {'<<'}
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {'<'}
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {'>'}
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {'>>'}
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>
                Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
              </span>
              <span className="text-gray-500">|</span>
              <span>
                Hiển thị {table.getRowModel().rows.length} / {table.getRowCount()} khách hàng
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCustomers

