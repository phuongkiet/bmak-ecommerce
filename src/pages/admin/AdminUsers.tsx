import { useEffect, useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from '@tanstack/react-table'
import { UserSummaryDto } from '@/models/User'
import { useStore } from '@/store'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { Edit, Trash2, RefreshCw } from 'lucide-react'

const AdminUsers = observer(() => {
  const [sorting, setSorting] = useState<SortingState>([])
  const { userStore } = useStore()
  const navigate = useNavigate()

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [restoringId, setRestoringId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  useEffect(() => {
    void userStore.fetchUser({ pageIndex: pagination.pageIndex + 1, pageSize: pagination.pageSize })
  }, [pagination.pageIndex, pagination.pageSize, userStore])

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    setConfirmDeleteId(null)
    try {
      await userStore.deleteUser(id, false)
    } finally {
      setDeletingId(null)
    }
  }

  const handleRestore = async (id: number) => {
    setRestoringId(id)
    try {
      await userStore.restoreUser(id)
    } finally {
      setRestoringId(null)
    }
  }

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
        cell: ({ row }) => <span className="text-sm text-gray-900">{row.original.email}</span>,
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Số điện thoại',
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">{row.original.phoneNumber || 'N/A'}</span>
        ),
      },
      {
        accessorKey: 'roles',
        header: 'Vai trò',
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {row.original.roles || 'Customer'}
          </span>
        ),
      },
      {
        accessorKey: 'isDeleted',
        header: 'Trạng thái',
        cell: ({ row }) =>
          row.original.isDeleted ? (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Đã xóa</span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Hoạt động</span>
          ),
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/admin/customers/${user.id}`)}
                className="text-primary-600 hover:text-primary-900 transition-colors"
                title="Chỉnh sửa"
              >
                <Edit size={18} />
              </button>

              {user.isDeleted ? (
                <button
                  onClick={() => void handleRestore(user.id)}
                  disabled={restoringId === user.id}
                  className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50"
                  title="Khôi phục"
                >
                  <RefreshCw size={18} />
                </button>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(user.id)}
                  disabled={deletingId === user.id}
                  className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                  title="Xóa"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          )
        },
      },
    ],
    [deletingId, restoringId, navigate]
  )

  const table = useReactTable({
    data: userStore.users?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    rowCount: userStore.users?.metaData?.totalItems ?? 0,
    onSortingChange: setSorting,
    state: { sorting, pagination },
    onPaginationChange: setPagination,
  })

  return (
    <div>
      {/* Confirm delete dialog */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc muốn xóa người dùng này không? Thao tác này có thể khôi phục được.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => void handleDelete(confirmDeleteId)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Quản lý khách hàng</h1>
        <button
          onClick={() => navigate('/admin/customers/new')}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Thêm user
        </button>
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
                          className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center gap-2' : ''}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userStore.isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                    Chưa có khách hàng nào
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className={`hover:bg-gray-50 ${row.original.isDeleted ? 'opacity-60' : ''}`}>
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

        {(userStore.users && userStore.users.items.length > 0) && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">{'<<'}</button>
              <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">{'<'}</button>
              <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">{'>'}</button>
              <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">{'>>'}</button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>Trang {pagination.pageIndex + 1} / {table.getPageCount()}</span>
              <span className="text-gray-500">|</span>
              <span>Hiển thị {userStore.users?.items.length ?? 0} / {userStore.users?.metaData.totalItems ?? 0} khách hàng</span>
              <span className="text-gray-500">|</span>
              <label className="text-sm text-gray-600">Số hàng:</label>
              <select
                value={pagination.pageSize}
                onChange={(e) => { table.setPageSize(Number(e.target.value)); table.setPageIndex(0) }}
                className="border rounded px-2 py-1 text-sm"
              >
                {[5, 10, 20, 50].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

export default AdminUsers

