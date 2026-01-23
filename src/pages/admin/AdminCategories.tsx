import { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import { Plus, Edit, Trash2 } from 'lucide-react'
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
import type { CategoryDto } from '@/models/Category'

const AdminCategories = observer(() => {
  const { categoryStore } = useStore()
  const [sorting, setSorting] = useState<SortingState>([])

  useEffect(() => {
    categoryStore.fetchCategories()
  }, [])

  const columns = useMemo<ColumnDef<CategoryDto>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Tên danh mục',
        cell: ({ row }) => (
          <span className="text-sm font-medium text-gray-900">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">{row.original.slug}</span>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Mô tả',
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">{row.original.description || 'N/A'}</span>
        ),
      },
      {
        accessorKey: 'parentName',
        header: 'Danh mục cha',
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">{row.original.parentName || '—'}</span>
        ),
      },
      {
        accessorKey: 'productCount',
        header: 'Số sản phẩm',
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">{row.original.productCount || 0}</span>
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
    data: categoryStore.categories,
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
          <Plus size={20} />
          Thêm danh mục
        </button>
      </div>

      {categoryStore.isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Đang tải...</p>
        </div>
      ) : categoryStore.error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {categoryStore.error}
        </div>
      ) : (
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
                      Chưa có danh mục nào
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
                  Hiển thị {table.getRowModel().rows.length} / {table.getRowCount()} danh mục
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

export default AdminCategories

