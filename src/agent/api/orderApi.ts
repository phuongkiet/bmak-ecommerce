import { apiClient } from './apiClient'
import { OrderDto, CreateOrderData, OrderSummaryDto, OrderParams } from '@/models/Order'
import { ApiResponse } from './apiClient'
import { PaginatedResult } from '@/models/Common'

interface CreateOrderResponse {
  isSuccess: boolean
  value: number // orderId
  error: string | null
}

export const createOrder = async (data: CreateOrderData): Promise<CreateOrderResponse> => {
  const response = await apiClient.post<CreateOrderResponse>('/Orders', data)
  return response
}

export const getOrders = async (params: OrderParams): Promise<PaginatedResult<OrderSummaryDto[]>> => {
    // 1. Build query string (Giữ nguyên cách của bạn, rất tốt)
    const queryParams = new URLSearchParams()
    queryParams.append('pageIndex', params.pageNumber.toString())
    queryParams.append('pageSize', params.pageSize.toString())
    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm)
    if (params.status) queryParams.append('status', params.status)
    if (params.sort) queryParams.append('sort', params.sort)

    // 2. Gọi API
    const response = await apiClient.getWithHeaders<any>(`/Orders?${queryParams.toString()}`)

    // response.data có thể là:
    // - ApiResponse<PaginatedResponse>
    // - PaginatedResponse
    // - trực tiếp array OrderSummaryDto[]
    const raw = response.data

    // unwrap ApiResponse if present
    const body = raw && typeof raw === 'object' && 'value' in raw ? raw.value : raw

    // items extraction
    let items: OrderSummaryDto[] = []
    if (Array.isArray(body)) {
      items = body
    } else if (body && 'items' in body && Array.isArray(body.items)) {
      items = body.items
    }

    // Metadata: prefer header 'pagination' if present, else extract from body (support pageIndex/pageNumber)
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

export const getOrderById = async (id: number): Promise<OrderDto> => {
  const response = await apiClient.get<ApiResponse<OrderDto> | OrderDto>(`/Orders/${id}`)
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

