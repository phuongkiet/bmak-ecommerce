import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useStore } from '@/store'
import { formatDate } from '@/utils'
import type { NewsPostSummaryDto } from '@/models/NewsPost'
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

const AdminNewsPosts = observer(() => {
  const navigate = useNavigate()
  const { newsStore, commonStore } = useStore()
  const [sorting, setSorting] = useState<SortingState>([])

  useEffect(() => {
    newsStore.fetchNewsPosts()
  }, [newsStore])

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa bài viết này?')
    if (!confirmed) return

    try {
      await newsStore.deleteNewsPost(id)
      commonStore.showSuccess('Xóa bài viết thành công')
    } catch (error) {
      console.error('Failed to delete news post:', error)
      commonStore.showError(newsStore.error || 'Không thể xóa bài viết. Vui lòng thử lại.')
    }
  }

  const columns = useMemo<ColumnDef<NewsPostSummaryDto>[]>(
    () => [
      {
        accessorKey: 'thumbnailUrl',
        header: 'Ảnh',
        cell: ({ row }) => (
          <img
            src={row.original.thumbnailUrl || '/images/default/no-image.png'}
            alt={row.original.title}
            className="h-12 w-12 object-contain bg-gray-50 rounded"
          />
        ),
      },
      {
        accessorKey: 'title',
        header: 'Tiêu đề',
        cell: ({ row }) => (
          <div className="max-w-md">
            <div className="text-sm font-medium text-gray-900 line-clamp-2">
              {row.original.title}
            </div>
            <div className="text-xs text-gray-500">Slug: {row.original.slug}</div>
          </div>
        ),
      },
      {
        accessorKey: 'categoryName',
        header: 'Danh mục',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">{row.original.categoryName}</span>
        ),
      },
      {
        accessorKey: 'viewCount',
        header: 'Lượt xem',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">{row.original.viewCount || 0}</span>
        ),
      },
      {
        accessorKey: 'isPublished',
        header: 'Trạng thái',
        cell: ({ row }) => (
          <span
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              row.original.isPublished
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {row.original.isPublished ? 'Đã xuất bản' : 'Nháp'}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Ngày tạo',
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">{formatDate(row.original.createdAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              className="text-primary-600 hover:text-primary-900 transition-colors"
              onClick={() => navigate(`/admin/news/${row.original.id}`)}
            >
              <Edit size={18} />
            </button>
            <button
              className="text-red-600 hover:text-red-900 transition-colors"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
      },
    ],
    [navigate],
  )

  const table = useReactTable({
    data: newsStore.posts,
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
        <h1 className="text-3xl font-bold">Quản lý tin tức</h1>
        <button
          onClick={() => navigate('/admin/news/add')}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Thêm bài viết
        </button>
      </div>

      {newsStore.isLoadingPosts ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Đang tải...</p>
        </div>
      ) : newsStore.error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {newsStore.error}
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
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
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
                    <td
                      colSpan={columns.length}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Chưa có bài viết nào
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
                Hiển thị {table.getRowModel().rows.length} / {table.getRowCount()} bài viết
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default AdminNewsPosts