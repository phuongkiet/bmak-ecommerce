export interface ReportFilterParams {
  fromDate?: string
  toDate?: string
  top?: number
}

export interface RevenueByDateDto {
  date: string
  revenue: number
  orders: number
}

export interface RevenueReportDto {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  revenueByDate: RevenueByDateDto[]
}

export interface ProductReportItemDto {
  productId: number
  productName: string
  productSku: string
  totalQuantity: number
  revenue: number
  orders: number
}

export interface ProductReportDto {
  totalProductsSold: number
  totalRevenue: number
  topProducts: ProductReportItemDto[]
}