export interface OrderParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  status?: OrderStatus;
  sort?: string; 
  userId?: number;
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
  productImage?: string;
  unitPrice: number;
  quantity: number;
  quantitySquareMeter: number;
  totalLineAmount: number;
}

export interface OrderDto {
  id: number;
  orderCode: string;
  orderDate: string;
  status: OrderStatus;
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

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipping' | 'Completed' | 'Cancelled' | 'Returned'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface OrderAddressDto {
  province: string
  // district: string
  ward: string
  specificAddress: string
}

export interface CreateOrderData {
  cartId: string
  note?: string
  paymentMethod: string
  
  // Thông tin người mua / Thanh toán (Billing)
  buyerName: string
  buyerPhone: string
  buyerEmail: string
  billingAddress: OrderAddressDto
  
  // Cờ checkbox: Giao đến địa chỉ khác
  shipToDifferentAddress: boolean
  
  // Thông tin người nhận (Shipping) - optional
  receiverName?: string
  receiverPhone?: string
  shippingAddress?: OrderAddressDto
}





