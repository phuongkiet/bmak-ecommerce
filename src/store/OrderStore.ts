import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import { OrderDto, OrderSummaryDto, OrderParams, CreateOrderData } from '@/models/Order'
import * as orderApi from '@/agent/api/orderApi'
import { PaginatedResult } from '@/models/Common';
import { OrderStatus } from "@/models/Order";

class OrderStore {
  orders: PaginatedResult<OrderSummaryDto[]> | null = null;
  selectedOrder: OrderDto | null = null
  isLoading: boolean = false
  error: string | null = null
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  async createOrder(data: CreateOrderData): Promise<{ success: boolean; orderId?: number; error?: string }> {
    this.isLoading = true
    this.error = null

    try {
      const result = await orderApi.createOrder(data)
      
      runInAction(() => {
        this.isLoading = false
      })

      if (result.isSuccess) {
        return { success: true, orderId: result.value }
      } else {
        runInAction(() => {
          this.error = result.error || 'Đặt hàng thất bại'
        })
        return { success: false, error: result.error || 'Đặt hàng thất bại' }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi đặt hàng'
      runInAction(() => {
        this.error = errorMessage
        this.isLoading = false
      })
      return { success: false, error: errorMessage }
    }
  }

  async fetchOrders(params: OrderParams): Promise<void> {
    this.isLoading = true
    this.error = null

    try {
      const result = await orderApi.getOrders(params)
      runInAction(() => {
        this.orders = result;
        console.log('Fetched orders:', this.orders);
        this.isLoading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to fetch orders'
        this.isLoading = false
      })
      console.error('Error fetching orders:', error)
    }
  }

  async fetchOrderById(id: number): Promise<void> {
    this.isLoading = true
    this.error = null

    try {
      const data = await orderApi.getOrderById(id)
      runInAction(() => {
        this.selectedOrder = data
        this.isLoading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to fetch order'
        this.isLoading = false
      })
    }
  }

  async cancelOrder(id: number): Promise<void> {
    this.isLoading = true
    this.error = null

    try {
      const data = await orderApi.cancelOrder(id)
      runInAction(() => {
                // Update selectedOrder nếu đang xem chi tiết đơn đó
                if (this.selectedOrder && this.selectedOrder.id === id) {
                    this.selectedOrder = data;
                }

                // FIX LỖI Ở ĐÂY:
                // 1. Kiểm tra this.orders khác null
                if (this.orders && this.orders.items) {
                    // 2. Tìm index trong mảng .items
                    const index = this.orders.items.findIndex(o => o.id === id);
                    
                    if (index !== -1) {
                        // 3. Cập nhật trạng thái cho item trong mảng items
                        // (Dùng 'as string' để an toàn nếu type status giữa Detail và Summary hơi lệch nhau)
                        this.orders.items[index].status = data.status as OrderStatus;
                    }
                }
            });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to cancel order'
        this.isLoading = false
      })
      throw error
    }
  }

  clearSelectedOrder(): void {
    this.selectedOrder = null
  }

  clearError(): void {
    this.error = null
  }
}

export default OrderStore
