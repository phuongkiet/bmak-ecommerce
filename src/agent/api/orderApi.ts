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
    // Lưu ý: response.data lúc này là kiểu PagedList<OrderSummaryDto> chứ không phải OrderSummaryDto[]
    const response = await apiClient.getWithHeaders<any>(`/Orders?${queryParams.toString()}`)

    // 3. Xử lý Metadata (Ưu tiên Header -> Fallback xuống Body)
    const paginationHeader = response.headers.get('pagination') || response.headers.get('Pagination');
    
    let metaData;
    
    if (paginationHeader) {
        metaData = JSON.parse(paginationHeader);
    } else {
        // Fallback: Lấy metadata từ Body (vì Backend trả về PagedList object)
        metaData = {
            currentPage: response.data.pageNumber || params.pageNumber,
            totalPages: response.data.totalPages || 0,
            itemsPerPage: response.data.pageSize || params.pageSize,
            totalItems: response.data.totalCount || 0
        };
    }

    return {
        // ✅ FIX QUAN TRỌNG: Phải chọc vào .items
        // Kiểm tra an toàn: nếu response.data là mảng (trường hợp cũ) thì dùng luôn, 
        // còn nếu là object (PagedList) thì lấy .items
        items: Array.isArray(response.data) ? response.data : (response.data.items || []),
        
        metaData: metaData
    }
}

export const getOrderById = async (id: number): Promise<OrderDto> => {
  const response = await apiClient.get<ApiResponse<OrderDto> | OrderDto>(`/Orders/${id}`)
  // Handle both response formats
  if ('id' in response && 'orderCode' in response) {
    return response as OrderDto
  }
  return (response as ApiResponse<OrderDto>).data
}

export const cancelOrder = async (id: number): Promise<OrderDto> => {
  const response = await apiClient.put<ApiResponse<OrderDto> | OrderDto>(`/Orders/${id}/cancel`)
  // Handle both response formats
  if ('id' in response && 'orderCode' in response) {
    return response as OrderDto
  }
  return (response as ApiResponse<OrderDto>).data
}

