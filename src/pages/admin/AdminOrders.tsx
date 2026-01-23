import { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Filter, Eye } from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  PaginationState,
} from '@tanstack/react-table'
import type { OrderSummaryDto } from '@/models/Order'
import { formatPrice } from '@/utils'
import { useStore } from '@/store'

const AdminOrders = () => {
  const { orderStore } = useStore()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, // TanStack dùng 0-index, BE của bạn dùng 1-index (lưu ý chỗ này)
    pageSize: 10,
  })

  useEffect(() => {
    // Gọi API khi pagination thay đổi
    orderStore.fetchOrders({
      pageNumber: pagination.pageIndex + 1, // Convert 0 -> 1 cho BE
      pageSize: pagination.pageSize,
      sort: 'orderDateDesc',
    })
  }, [orderStore, pagination.pageIndex, pagination.pageSize])

  const columns = useMemo<ColumnDef<OrderSummaryDto>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Mã đơn',
        cell: ({ row }) => (
          <span className="text-sm font-medium text-gray-900">#{row.original.id}</span>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Khách hàng',
        cell: ({ row }) => (
          <div>
            <div className="text-sm font-medium text-gray-900">{row.original.customerName}</div>
          </div>
        ),
      },
      {
        accessorKey: 'totalAmount',
        header: 'Tổng tiền',
        cell: ({ row }) => (
          <span className="text-sm font-medium text-gray-900">
            {formatPrice(row.original.totalAmount)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
          const status = row.original.status
          const statusColors: Record<OrderSummaryDto['status'], string> = {
            Pending: 'bg-yellow-100 text-yellow-800',
            Processing: 'bg-blue-100 text-blue-800',
            Shipped: 'bg-purple-100 text-purple-800',
            Delivered: 'bg-green-100 text-green-800',
            Cancelled: 'bg-red-100 text-red-800',
          }
          const statusLabels: Record<OrderSummaryDto['status'], string> = {
            Pending: 'Chờ xử lý',
            Processing: 'Đang xử lý',
            Shipped: 'Đã giao hàng',
            Delivered: 'Đã nhận',
            Cancelled: 'Đã hủy',
          }
          return (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}
            >
              {statusLabels[status]}
            </span>
          )
        },
      },
      {
        accessorKey: 'orderDate',
        header: 'Ngày đặt',
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">
            {new Date(row.original.orderDate).toLocaleDateString('vi-VN')}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: () => (
          <button className="text-primary-600 hover:text-primary-900 transition-colors">
            <Eye size={18} />
          </button>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    // ✅ FIX 1: Trỏ vào mảng items bên trong object orders
    data: orderStore.orders?.items || [], 
    columns,
    getCoreRowModel: getCoreRowModel(),
    
    // ✅ FIX 2: Cấu hình Server-Side Pagination
    manualPagination: true, // Báo cho Table biết là data đã được phân trang sẵn rồi
    rowCount: orderStore.orders?.metaData?.totalItems || 0, // Tổng số dòng (để tính số trang)
    
    state: {
      pagination, // Bind state vào table
    },
    onPaginationChange: setPagination, // Update state khi bấm nút Next/Prev
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter size={20} />
            Lọc
          </button>
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
              {orderStore.isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : orderStore.error ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-red-600">
                    Lỗi: {orderStore.error}
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                    Chưa có đơn hàng nào
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
                Hiển thị {table.getRowModel().rows.length} / {table.getRowCount()} đơn hàng
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default observer(AdminOrders)

