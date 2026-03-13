import type { OrderStatus } from '@/models/Order'

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Chờ xử lý',
  Confirmed: 'Đã xác nhận',
  Shipping: 'Đang giao',
  Completed: 'Hoàn thành',
  Cancelled: 'Đã hủy',
  Returned: 'Đã trả hàng',
}

export const getOrderStatusLabel = (status: OrderStatus): string => {
  return ORDER_STATUS_LABELS[status]
}

export { ORDER_STATUS_LABELS }