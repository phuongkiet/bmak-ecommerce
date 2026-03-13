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

type CategoryFormState = {
  name: string
  slug: string
  description: string
  parentId: string
  isActive: boolean
}

const AdminCategories = observer(() => {
  const { categoryStore } = useStore()
  const [sorting, setSorting] = useState<SortingState>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [formState, setFormState] = useState<CategoryFormState>({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    isActive: true,
  })

  useEffect(() => {
    void categoryStore.fetchAdminCategories()
  }, [categoryStore])

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormState({ name: '', slug: '', description: '', parentId: '', isActive: true })
    setIsModalOpen(true)
  }

  const openEditModal = (category: CategoryDto) => {
    setEditingCategory(category)
    setFormState({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId ? String(category.parentId) : '',
      isActive: category.isActive ?? true,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formState.name.trim() || !formState.slug.trim()) return

    const payload = {
      name: formState.name.trim(),
      slug: formState.slug.trim(),
      description: formState.description.trim() || undefined,
      parentId: formState.parentId ? Number(formState.parentId) : undefined,
      isActive: formState.isActive,
    }

    if (editingCategory) {
      const ok = await categoryStore.updateAdminCategory(editingCategory.id, {
        ...payload,
        id: editingCategory.id,
      })
      if (ok) setIsModalOpen(false)
      return
    }

    const ok = await categoryStore.createAdminCategory(payload)
    if (ok) setIsModalOpen(false)
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await categoryStore.deleteAdminCategory(id)
    } finally {
      setDeletingId(null)
    }
  }

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
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              className="text-primary-600 hover:text-primary-900 transition-colors"
              onClick={() => openEditModal(row.original)}
            >
              <Edit size={18} />
            </button>
            <button
              className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
              onClick={() => void handleDelete(row.original.id)}
              disabled={deletingId === row.original.id}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
      },
    ],
    [deletingId]
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
        <button
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          onClick={openCreateModal}
        >
          <Plus size={20} />
          Thêm danh mục
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold">
              {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tên danh mục</label>
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={formState.name}
                  onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={formState.slug}
                  onChange={(e) => setFormState((prev) => ({ ...prev, slug: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  rows={3}
                  value={formState.description}
                  onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Danh mục cha</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={formState.parentId}
                  onChange={(e) => setFormState((prev) => ({ ...prev, parentId: e.target.value }))}
                >
                  <option value="">Không có</option>
                  {categoryStore.categories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formState.isActive}
                  onChange={(e) => setFormState((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                Hiển thị danh mục
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                onClick={() => setIsModalOpen(false)}
              >
                Hủy
              </button>
              <button
                className="rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-60"
                onClick={() => void handleSubmit()}
                disabled={categoryStore.isLoading || !formState.name.trim() || !formState.slug.trim()}
              >
                {editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục'}
              </button>
            </div>
          </div>
        </div>
      )}

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

