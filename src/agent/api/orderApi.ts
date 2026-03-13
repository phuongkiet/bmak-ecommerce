import { apiClient } from './apiClient'
import { OrderDto, CreateOrderData, OrderSummaryDto, OrderParams, OrderStatus } from '@/models/Order'
import { ApiResponse } from './apiClient'
import { PaginatedResult } from '@/models/Common'

interface CreateOrderResponse {
  isSuccess: boolean
  value: number // orderId
  error: string | null
}

interface UpdateOrderStatusPayload {
  status: number
}

const orderStatusToEnumValue: Record<OrderStatus, number> = {
  Pending: 1,
  Confirmed: 2,
  Shipping: 3,
  Completed: 4,
  Cancelled: 5,
  Returned: 6,
}

const buildOrderQueryParams = (params: OrderParams): URLSearchParams => {
  const queryParams = new URLSearchParams()
  queryParams.append('pageIndex', params.pageNumber.toString())
  queryParams.append('pageSize', params.pageSize.toString())

  if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm)
  if (params.status) queryParams.append('status', params.status)
  if (params.sort) queryParams.append('sort', params.sort)

  return queryParams
}

const mapPaginatedOrdersResponse = (
  response: { data: any; headers: Headers },
  params: OrderParams
): PaginatedResult<OrderSummaryDto[]> => {
  const raw = response.data
  const body = raw && typeof raw === 'object' && 'value' in raw ? raw.value : raw

  let items: OrderSummaryDto[] = []
  if (Array.isArray(body)) {
    items = body
  } else if (body && 'items' in body && Array.isArray(body.items)) {
    items = body.items
  }

  const paginationHeader = response.headers.get('pagination') || response.headers.get('Pagination')
  let metaData

  if (paginationHeader) {
    try {
      const parsed = JSON.parse(paginationHeader)
      metaData = {
        currentPage: parsed.currentPage ?? parsed.pageIndex ?? parsed.pageNumber ?? params.pageNumber,
        totalPages: parsed.totalPages ?? 0,
        itemsPerPage: parsed.itemsPerPage ?? parsed.pageSize ?? params.pageSize,
        totalItems: parsed.totalItems ?? parsed.totalCount ?? 0,
      }
    } catch {
      metaData = {
        currentPage: params.pageNumber,
        totalPages: 0,
        itemsPerPage: params.pageSize,
        totalItems: 0,
      }
    }
  } else {
    metaData = {
      currentPage: (body && (body.pageIndex ?? body.pageNumber)) ?? params.pageNumber,
      totalPages: (body && (body.totalPages ?? 0)) ?? 0,
      itemsPerPage: (body && (body.pageSize ?? params.pageSize)) ?? params.pageSize,
      totalItems: (body && (body.totalCount ?? 0)) ?? 0,
    }
  }

  return {
    items,
    metaData,
  }
}

export const createOrder = async (data: CreateOrderData): Promise<CreateOrderResponse> => {
  const response = await apiClient.post<CreateOrderResponse>('/Orders', data)
  return response
}

export const getOrders = async (params: OrderParams): Promise<PaginatedResult<OrderSummaryDto[]>> => {
    const queryParams = buildOrderQueryParams(params)
  const response = await apiClient.getWithHeaders<any>(`/admin/orders?${queryParams.toString()}`)
    return mapPaginatedOrdersResponse(response, params)
}

export const getOrdersOfUser = async (params: OrderParams): Promise<PaginatedResult<OrderSummaryDto[]>> => {
    const queryParams = buildOrderQueryParams(params)
    const response = await apiClient.getWithHeaders<any>(`/Orders?${queryParams.toString()}`)
    return mapPaginatedOrdersResponse(response, params)
}

export const getOrderById = async (orderCode: string): Promise<OrderDto> => {
  const response = await apiClient.get<ApiResponse<OrderDto> | OrderDto>(`/Orders/${orderCode}`)
  // Handle both response formats
  if ('id' in response && 'orderCode' in response) {
    return response as OrderDto
  }
  return (response as ApiResponse<OrderDto>).value as OrderDto
}

export const cancelOrder = async (id: number): Promise<OrderDto> => {
  const response = await apiClient.put<ApiResponse<OrderDto> | OrderDto>(`/Orders/${id}/cancel`)
  // Handle both response formats
  if ('id' in response && 'orderCode' in response) {
    return response as OrderDto
  }
  return (response as ApiResponse<OrderDto>).value as OrderDto
}

export const getAdminOrderByCode = async (orderCode: string): Promise<OrderDto> => {
  const response = await apiClient.get<ApiResponse<OrderDto> | OrderDto>(`/admin/orders/${orderCode}`)
  if ('id' in response && 'orderCode' in response) {
    return response as OrderDto
  }
  return (response as ApiResponse<OrderDto>).value as OrderDto
}

export const updateAdminOrderStatus = async (
  orderCode: string,
  status: OrderStatus
): Promise<boolean> => {
  const payload: UpdateOrderStatusPayload = { status: orderStatusToEnumValue[status] }
  const response = await apiClient.patch<ApiResponse<boolean> | boolean>(
    `/admin/orders/${orderCode}/status`,
    payload
  )

  if (typeof response === 'boolean') {
    return response
  }

  return Boolean(response.value)
}

