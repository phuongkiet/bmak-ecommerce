import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import type { OrderSummaryDto } from "@/models/Order";
import { formatPrice, getOrderStatusLabel } from "@/utils";
import { useStore } from "@/store";

const statusColors: Record<OrderSummaryDto["status"], string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Shipping: "bg-purple-100 text-purple-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
  Returned: "bg-gray-200 text-gray-800",
};

const UserOrdersTable = observer(() => {
  const { orderStore, authStore } = useStore();
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const currentUserId = authStore.user?.id;
    if (!currentUserId) return;

    void orderStore.fetchOrdersOfUser({
      pageNumber: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      sort: "orderDateDesc",
    });
  }, [orderStore, authStore.user?.id, pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    return () => {
      orderStore.clearSelectedOrder();
    };
  }, [orderStore]);

  const handleViewOrderDetail = async (orderNumber: string) => {
    setLoadingDetailId(orderNumber);
    try {
      await orderStore.fetchOrderById(orderNumber);
    } finally {
      setLoadingDetailId(null);
    }
  };

  const getPaymentMethodLabel = (paymentMethod: string) => {
    const normalized = String(paymentMethod).toLowerCase();

    if (normalized === "1" || normalized === "cod") return "Thanh toán khi nhận hàng (COD)";
    if (normalized === "2" || normalized === "banking") return "Chuyển khoản ngân hàng";
    if (normalized === "3" || normalized === "vnpay") return "VNPay";

    return paymentMethod;
  };

  const columns = useMemo<ColumnDef<OrderSummaryDto>[]>(
    () => [
      {
        accessorKey: "orderCode",
        header: "Mã đơn",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-gray-900">
            {row.original.orderCode || `#${row.original.id}`}
          </span>
        ),
      },
      {
        accessorKey: "orderDate",
        header: "Ngày đặt",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {new Date(row.original.orderDate).toLocaleDateString("vi-VN")}
          </span>
        ),
      },
    //   {
    //     accessorKey: "itemCount",
    //     header: "Số SP",
    //     cell: ({ row }) => <span className="text-sm text-gray-700">{row.original.itemCount}</span>,
    //   },
      {
        accessorKey: "totalAmount",
        header: "Tổng tiền",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-gray-900">
            {formatPrice(row.original.totalAmount)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[row.original.status]}`}
          >
            {getOrderStatusLabel(row.original.status)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        cell: ({ row }) => {
          const orderNumber = row.original.orderCode || String(row.original.id);

          return (
            <button
                onClick={() => void handleViewOrderDetail(orderNumber)}
                disabled={loadingDetailId === orderNumber}
                className="text-primary-600 hover:underline text-sm disabled:text-gray-400 disabled:no-underline"
            >
                {loadingDetailId === orderNumber ? "Đang tải..." : "Xem chi tiết"}
            </button>
          );
        },
      }
    ],
    [loadingDetailId],
  );

  const table = useReactTable({
    data: orderStore.orders?.items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: orderStore.orders?.metaData?.totalItems || 0,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  return (
    <div>
      <h2 className="text-4xl font-bold mb-6">Đơn hàng của bạn</h2>
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
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orderStore.isLoading && loadingDetailId === null ? (
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
                    Bạn chưa có đơn hàng nào
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
                Hiển thị {table.getRowModel().rows.length} / {table.getRowCount()} đơn hàng
              </span>
            </div>
          </div>
        )}
      </div>

      {orderStore.selectedOrder && (
        <div className="mt-8 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h3>
              <p className="text-gray-600 mt-1">
                {orderStore.selectedOrder.orderCode || `#${orderStore.selectedOrder.id}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => orderStore.clearSelectedOrder()}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Đóng
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Trạng thái</p>
                <span
                  className={`inline-flex mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                    statusColors[orderStore.selectedOrder.status as OrderSummaryDto["status"]] ||
                    "bg-gray-100 text-gray-700"
                  }`}
                >
                  {getOrderStatusLabel(orderStore.selectedOrder.status as OrderSummaryDto["status"])}
                </span>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Ngày đặt</p>
                <p className="mt-2 font-semibold text-gray-900">
                  {new Date(orderStore.selectedOrder.orderDate).toLocaleString("vi-VN")}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Khách hàng</p>
                <p className="mt-2 font-semibold text-gray-900">{orderStore.selectedOrder.customerName}</p>
                <p className="text-gray-600">{orderStore.selectedOrder.customerPhone}</p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                <p className="mt-2 font-semibold text-gray-900">
                  {getPaymentMethodLabel(orderStore.selectedOrder.paymentMethod)}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h4 className="font-semibold text-gray-900">Sản phẩm trong đơn</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orderStore.selectedOrder.orderItems.map((item, index) => (
                      <tr key={`${item.productId}-${index}`}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-right">{formatPrice(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                          {formatPrice(item.totalLineAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                <p className="mt-2 text-gray-900 leading-relaxed">{orderStore.selectedOrder.shippingAddress}</p>
                {orderStore.selectedOrder.note && (
                  <>
                    <p className="text-sm text-gray-500 mt-4">Ghi chú</p>
                    <p className="mt-1 text-gray-900">{orderStore.selectedOrder.note}</p>
                  </>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <span>Tạm tính</span>
                  <span>{formatPrice(orderStore.selectedOrder.subTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(orderStore.selectedOrder.shippingFee)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <span>Giảm giá</span>
                  <span>- {formatPrice(orderStore.selectedOrder.discountAmount)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
                  <span className="text-base font-semibold text-gray-900">Tổng cộng</span>
                  <span className="text-lg font-bold text-primary-600">
                    {formatPrice(orderStore.selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default UserOrdersTable;