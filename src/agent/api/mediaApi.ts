import { apiClient, ApiResponse } from './apiClient'
import { PaginatedResult } from '@/models/Common'
import { AppImageDto, ImageParams } from '@/models/Image'

export const uploadImage = async (file: File): Promise<AppImageDto> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.postForm<ApiResponse<AppImageDto> | AppImageDto>('/Media', formData)
  if (response && typeof response === 'object' && 'id' in response && 'url' in response) {
    return response as AppImageDto
  }
  return (response as ApiResponse<AppImageDto>).value as AppImageDto
}

export const getImages = async (params: ImageParams): Promise<PaginatedResult<AppImageDto[]>> => {
  const queryParams = new URLSearchParams()
  queryParams.append('pageIndex', params.pageIndex.toString())
  queryParams.append('pageSize', params.pageSize.toString())
  if (params.search) queryParams.append('search', params.search)

  const response = await apiClient.getWithHeaders<any>(`/Media?${queryParams.toString()}`)

  const raw = response.data
  const body = raw && typeof raw === 'object' && 'value' in raw ? raw.value : raw

  let items: AppImageDto[] = []
  if (Array.isArray(body)) items = body
  else if (body && 'items' in body && Array.isArray(body.items)) items = body.items

  const paginationHeader = response.headers.get('pagination') || response.headers.get('Pagination')
  let metaData
  if (paginationHeader) {
    try {
      const parsed = JSON.parse(paginationHeader)
      metaData = {
        currentPage: parsed.currentPage ?? parsed.pageIndex ?? params.pageIndex,
        totalPages: parsed.totalPages ?? 0,
        itemsPerPage: parsed.itemsPerPage ?? parsed.pageSize ?? params.pageSize,
        totalItems: parsed.totalItems ?? parsed.totalCount ?? 0,
      }
    } catch {
      metaData = {
        currentPage: params.pageIndex,
        totalPages: 0,
        itemsPerPage: params.pageSize,
        totalItems: 0,
      }
    }
  } else {
    metaData = {
      currentPage: (body && (body.pageIndex ?? body.pageNumber)) ?? params.pageIndex,
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

export const deleteImage = async (id: number): Promise<boolean> => {
  const response = await apiClient.delete<ApiResponse<boolean> | boolean>(`/Media/${id}`)
  if (typeof response === 'boolean') return response
  return (response as ApiResponse<boolean>).value ?? false
}

