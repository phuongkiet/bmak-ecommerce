import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { Filter, Power, Trash2, Plus, Edit } from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
} from '@tanstack/react-table'
import { useStore } from '@/store'
import type { VoucherDto } from '@/models/Voucher'
import { formatPrice } from '@/utils'

const isPercentDiscountType = (rawType?: string | number): boolean => {
  if (typeof rawType === 'number') {
    return rawType === 2
  }

  const normalized = String(rawType || '').toLowerCase()
  if (!normalized) return false

  return (
    normalized.includes('percent') ||
    normalized.includes('percentage') ||
    normalized.includes('%') ||
    normalized === '2'
  )
}

const AdminVouchers = observer(() => {
  const navigate = useNavigate()
  const { voucherStore } = useStore()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    const timeout = setTimeout(() => {
      void voucherStore.fetchVouchers({
        pageIndex: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        search: searchTerm.trim() || undefined,
        isActive:
          statusFilter === 'all' ? undefined : statusFilter === 'active',
      })
    }, 300)

    return () => clearTimeout(timeout)
  }, [voucherStore, pagination.pageIndex, pagination.pageSize, searchTerm, statusFilter])

  const handleToggleStatus = async (voucher: VoucherDto) => {
    try {
      await voucherStore.toggleVoucherStatus(voucher.id, {
        isActive: !voucher.isActive,
      })

      await voucherStore.fetchVouchers({
        pageIndex: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        search: searchTerm.trim() || undefined,
        isActive:
          statusFilter === 'all' ? undefined : statusFilter === 'active',
      })
    } catch {
      // Errors are already tracked in store.error
    }
  }

  const handleDeleteVoucher = async (voucher: VoucherDto) => {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa voucher \"${voucher.code}\"?`)
    if (!confirmed) return

    try {
      await voucherStore.deleteVoucher(voucher.id)

      await voucherStore.fetchVouchers({
        pageIndex: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        search: searchTerm.trim() || undefined,
        isActive:
          statusFilter === 'all' ? undefined : statusFilter === 'active',
      })
    } catch {
      // Errors are already tracked in store.error
    }
  }

  const columns = useMemo<ColumnDef<VoucherDto>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Mã voucher',
        cell: ({ row }) => (
          <div>
            <div className="text-sm font-semibold text-gray-900">{row.original.code}</div>
            <div className="text-xs text-gray-500">{row.original.name || 'Không có tên'}</div>
          </div>
        ),
      },
      {
        accessorKey: 'discountValue',
        header: 'Giảm giá',
        cell: ({ row }) => {
          const value = Number(row.original.discountValue || 0)
          const isPercent = isPercentDiscountType(row.original.discountType)

          const display =
            isPercent
              ? `${value}%`
              : formatPrice(value)

          return (
            <div className="text-sm text-gray-900">
              <div className="font-medium">{display}</div>
              {row.original.maxDiscountAmount ? (
                <div className="text-xs text-gray-500">
                  Tối đa: {formatPrice(row.original.maxDiscountAmount)}
                </div>
              ) : null}
            </div>
          )
        },
      },
      {
        accessorKey: 'minOrderAmount',
        header: 'Đơn tối thiểu',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {row.original.minOrderAmount ? formatPrice(row.original.minOrderAmount) : 'Không yêu cầu'}
          </span>
        ),
      },
      {
        accessorKey: 'usageLimit',
        header: 'Lượt dùng',
        cell: ({ row }) => {
          const used = row.original.usedCount ?? 0
          const limit = row.original.usageLimit
          return (
            <span className="text-sm text-gray-700">
              {limit ? `${used}/${limit}` : `${used}/Không giới hạn`}
            </span>
          )
        },
      },
      {
        accessorKey: 'endDate',
        header: 'Hết hạn',
        cell: ({ row }) => {
          const endDate = row.original.endDate
          if (!endDate) return <span className="text-sm text-gray-500">Không giới hạn</span>

          return (
            <span className="text-sm text-gray-700">
              {new Date(endDate).toLocaleDateString('vi-VN')}
            </span>
          )
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Trạng thái',
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              row.original.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {row.original.isActive ? 'Đang bật' : 'Đã tắt'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/admin/vouchers/${row.original.id}`)}
              className="text-primary-600 hover:text-primary-900 transition-colors"
              title="Chỉnh sửa voucher"
            >
              <Edit size={18} />
            </button>
            <button
              type="button"
              onClick={() => void handleToggleStatus(row.original)}
              className="text-primary-600 hover:text-primary-900 transition-colors"
              title={row.original.isActive ? 'Tắt voucher' : 'Bật voucher'}
            >
              <Power size={18} />
            </button>
            <button
              type="button"
              onClick={() => void handleDeleteVoucher(row.original)}
              className="text-red-600 hover:text-red-900 transition-colors"
              title="Xóa voucher"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
      },
    ],
    [pagination.pageIndex, pagination.pageSize, searchTerm, statusFilter],
  )

  const table = useReactTable({
    data: voucherStore.vouchers?.items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: voucherStore.vouchers?.totalCount || 0,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Quản lý voucher</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/vouchers/add')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Thêm voucher
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter size={20} />
            Bộ lọc
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
            placeholder="Tìm theo mã hoặc tên voucher..."
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang bật</option>
            <option value="inactive">Đã tắt</option>
          </select>
        </div>

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
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {voucherStore.isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : voucherStore.error ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-red-600">
                    Lỗi: {voucherStore.error}
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                    Chưa có voucher nào
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
                Hiển thị {table.getRowModel().rows.length} / {table.getRowCount()} voucher
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

export default AdminVouchers
