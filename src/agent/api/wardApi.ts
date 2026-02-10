import { ApiResponse, apiClient } from './apiClient'
import { WardDto } from '@/models/Ward'

export interface PaginatedResponse<T> {
  items: T[]
  pageIndex: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export const getWards = async (pageIndex: number = 1, pageSize: number = 50): Promise<WardDto[]> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<WardDto>> | PaginatedResponse<WardDto>>(`/Ward?pageIndex=${pageIndex}&pageSize=${pageSize}`)
  // support both wrapped ApiResponse and direct paginated response
  if ('value' in response) {
    return response.value?.items || []
  }
  if ('items' in response) {
    return response.items || []
  }
  return []
}

export const getWardsByProvinceId = async (provinceId: string, pageIndex: number = 1, pageSize: number = 50): Promise<WardDto[]> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<WardDto>> | PaginatedResponse<WardDto>>(`/Ward?ProvinceId=${provinceId}&pageIndex=${pageIndex}&pageSize=${pageSize}`)
  if ('value' in response) {
    return response.value?.items || []
  }
  if ('items' in response) {
    return response.items || []
  }
  return []
}


