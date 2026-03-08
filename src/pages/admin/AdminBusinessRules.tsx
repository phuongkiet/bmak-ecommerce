import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Edit, Filter, Plus, Power, Trash2 } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import { useStore } from "@/store";
import type { BusinessRuleDto } from "@/models/BusinessRule";

const formatDate = (raw?: string): string => {
  if (!raw) return "-";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("vi-VN");
};

const AdminBusinessRules = observer(() => {
  const navigate = useNavigate();
  const { businessRuleStore } = useStore();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const fetchRules = async () => {
    await businessRuleStore.fetchBusinessRules({
      pageIndex: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      search: searchTerm.trim() || undefined,
      isActive: statusFilter === "all" ? undefined : statusFilter === "active",
    });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchRules();
    }, 300);

    return () => clearTimeout(timeout);
  }, [pagination.pageIndex, pagination.pageSize, searchTerm, statusFilter]);

  const handleToggleStatus = async (rule: BusinessRuleDto) => {
    try {
      await businessRuleStore.toggleBusinessRuleStatus(rule.id, {
        isActive: !Boolean(rule.isActive),
      });

      await fetchRules();
    } catch {
      // Errors are already tracked in store.error
    }
  };

  const handleDeleteRule = async (rule: BusinessRuleDto) => {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa rule \"${rule.name}\"?`);
    if (!confirmed) return;

    try {
      await businessRuleStore.deleteBusinessRule(rule.id);
      await fetchRules();
    } catch {
      // Errors are already tracked in store.error
    }
  };

  const columns = useMemo<ColumnDef<BusinessRuleDto>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Business rule",
        cell: ({ row }) => (
          <div>
            <div className="text-sm font-semibold text-gray-900">{row.original.name}</div>
            <div className="text-xs text-gray-500 line-clamp-1">
              {row.original.description || "Không có mô tả"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "priority",
        header: "Ưu tiên",
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">{row.original.priority}</span>
        ),
      },
      {
        accessorKey: "stopProcessing",
        header: "Stop Processing",
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">{row.original.stopProcessing ? "Có" : "Không"}</span>
        ),
      },
      {
        id: "conditionsActions",
        header: "Điều kiện/Hành động",
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {row.original.conditions?.length || 0} / {row.original.actions?.length || 0}
          </span>
        ),
      },
      {
        accessorKey: "startDate",
        header: "Hiệu lực",
        cell: ({ row }) => (
          <div className="text-sm text-gray-700">
            <div>Từ: {formatDate(row.original.startDate)}</div>
            <div>Đến: {formatDate(row.original.endDate)}</div>
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Trạng thái",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              row.original.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
            }`}
          >
            {row.original.isActive ? "Đang bật" : "Đã tắt"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/admin/business-rules/${row.original.id}`)}
              className="text-primary-600 hover:text-primary-900 transition-colors"
              title="Chỉnh sửa rule"
            >
              <Edit size={18} />
            </button>
            <button
              type="button"
              onClick={() => void handleToggleStatus(row.original)}
              className="text-primary-600 hover:text-primary-900 transition-colors"
              title={row.original.isActive ? "Tắt rule" : "Bật rule"}
            >
              <Power size={18} />
            </button>
            <button
              type="button"
              onClick={() => void handleDeleteRule(row.original)}
              className="text-red-600 hover:text-red-900 transition-colors"
              title="Xóa rule"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
      },
    ],
    [navigate],
  );

  const table = useReactTable({
    data: businessRuleStore.businessRules?.items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: businessRuleStore.businessRules?.totalCount || 0,
    state: { pagination },
    onPaginationChange: setPagination,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Quản lý business rule</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/business-rules/add")}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Thêm rule
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
              setSearchTerm(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            placeholder="Tìm theo tên hoặc mã rule..."
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "all" | "active" | "inactive");
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
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
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {businessRuleStore.isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : businessRuleStore.error ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-red-600">
                    Lỗi: {businessRuleStore.error}
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                    Chưa có business rule nào
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
                {"<<"}
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {"<"}
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {">"}
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {">>"}
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>
                Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
              </span>
              <span className="text-gray-500">|</span>
              <span>
                Hiển thị {table.getRowModel().rows.length} / {table.getRowCount()} rule
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default AdminBusinessRules;
