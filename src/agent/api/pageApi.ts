import { apiClient, ApiResponse } from './apiClient'
import type {
  PageDto,
  CreatePageCommand,
  UpdatePageCommand,
  GetPageParams,
  GetPagesResponse
} from '@/models/Page'

// GET: api/page - Lấy danh sách page có phân trang
export const getPages = async (params?: GetPageParams): Promise<ApiResponse<GetPagesResponse>> => {
  const queryParams = new URLSearchParams()
  
  if (params) {
    if (params.pageIndex) queryParams.append('pageIndex', params.pageIndex.toString())
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params.sort) queryParams.append('sort', params.sort)
    if (params.search) queryParams.append('search', params.search)
  }

  const queryString = queryParams.toString()
  const url = queryString ? `/Page?${queryString}` : '/Page'
  
  const response = await apiClient.get<ApiResponse<GetPagesResponse>>(url)
  return response
}

// GET: api/page/{slug} - Lấy chi tiết page theo slug
export const getPageBySlug = async (slug: string): Promise<ApiResponse<PageDto>> => {
  const response = await apiClient.get<ApiResponse<PageDto>>(`/Page/${slug}`)
  return response
}

// POST: api/page - Tạo page mới
export const createPage = async (command: CreatePageCommand): Promise<ApiResponse<{ slug: string }>> => {
  const response = await apiClient.post<ApiResponse<{ slug: string }>>('/Page', command)
  return response
}

// PUT: api/page/{id} - Cập nhật page theo ID (route-based)
export const updatePage = async (command: UpdatePageCommand): Promise<ApiResponse<number>> => {
  const response = await apiClient.put<ApiResponse<number>>(`/Page/${command.id}`, command)
  return response
}
