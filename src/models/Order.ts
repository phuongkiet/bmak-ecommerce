import { CartItem } from './CartItem'

export interface OrderParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  status?: OrderStatus;
  sort?: string; 
}

export interface OrderSummaryDto {
  id: number;
  orderCode: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  customerName: string;
  itemCount: number;
}

export interface OrderItemDto {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalLineAmount: number;
}

export interface OrderDto {
  id: number;
  orderCode: string;
  orderDate: string;
  status: string;
  paymentMethod: string;
  subTotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  note?: string;
  
  // Thông tin khách & ship
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  
  orderItems: OrderItemDto[];
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface CreateOrderData {
  items: CartItem[]
  shippingAddress: string
  shippingPhone: string
  shippingName: string
  paymentMethod: string
}





