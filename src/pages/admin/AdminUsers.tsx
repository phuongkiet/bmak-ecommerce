import { useEffect, useMemo, useState } from 'react'
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
import { UserSummaryDto } from '@/models/User'
import { useStore } from '@/store'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { Edit, Trash2 } from 'lucide-react'

const AdminUsers = observer(() => {
  const [sorting, setSorting] = useState<SortingState>([])
  const { userStore } = useStore()
  const navigate = useNavigate()

  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  // Initial load and when pagination changes
  useEffect(() => {
    userStore.fetchUser({ pageIndex: pageIndex + 1, pageSize })
  }, [pageIndex, pageSize, userStore])

  const columns = useMemo<ColumnDef<UserSummaryDto>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Tên người dùng',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                {row.original.fullName.charAt(0).toUpperCase()}
              </div>
            <span className="text-sm font-medium text-gray-900">{row.original.fullName}</span>
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
        accessorKey: 'phoneNumber',
        header: 'Số điện thoại',
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">{row.original.phoneNumber || 'N/A'}</span>
        ),
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: () => (
          <div className="flex items-center gap-2">
            <button className="text-primary-600 hover:text-primary-900 transition-colors">
              <Edit size={18} />
            </button>
            <button className="text-red-600 hover:text-red-900 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: userStore.users?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      pagination: { pageIndex, pageSize },
    },
    pageCount: userStore.users?.metaData?.totalPages ?? -1,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Quản lý khách hàng</h1>
        <div>
          <button onClick={() => navigate('/admin/users/new')} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Thêm user</button>
        </div>
      </div>

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
        { (userStore.users && userStore.users.items.length > 0) && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPageIndex(0)}
                disabled={pageIndex <= 0}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {'<<'}
              </button>
              <button
                onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                disabled={pageIndex <= 0}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {'<'}
              </button>
              <button
                onClick={() => setPageIndex(Math.min((userStore.users?.metaData.totalPages || 1) - 1, pageIndex + 1))}
                disabled={pageIndex >= ((userStore.users?.metaData.totalPages || 1) - 1)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {'>'}
              </button>
              <button
                onClick={() => setPageIndex((userStore.users?.metaData.totalPages || 1) - 1)}
                disabled={pageIndex >= ((userStore.users?.metaData.totalPages || 1) - 1)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {'>>'}
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>
                Trang {pageIndex + 1} / {userStore.users?.metaData.totalPages ?? 1}
              </span>
              <span className="text-gray-500">|</span>
              <span>
                Hiển thị {userStore.users?.items.length ?? 0} / {userStore.users?.metaData.totalItems ?? 0} khách hàng
              </span>
              <span className="text-gray-500">|</span>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Số hàng:</label>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPageIndex(0); }}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

export default AdminUsers

