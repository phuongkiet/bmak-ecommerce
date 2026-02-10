import { apiClient } from './apiClient'
import { CategoryDto, PagedList, CategorySpecParams, CreateCategoryCommand } from '@/models/Category'
import { ApiResponse } from './apiClient'

export const getCategories = async (params?: CategorySpecParams): Promise<PagedList<CategoryDto>> => {
  const queryParams = new URLSearchParams()
  
  if (params?.pageIndex) {
    queryParams.append('PageIndex', params.pageIndex.toString())
  }
  if (params?.pageSize) {
    queryParams.append('PageSize', params.pageSize.toString())
  }
  if (params?.search) {
    queryParams.append('search', params.search)
  }
  if (params?.parentId) {
    queryParams.append('parentId', params.parentId.toString())
  }
  if (params?.sortOrder) {
    queryParams.append('sortOrder', params.sortOrder)
  }

  const queryString = queryParams.toString()
  const endpoint = `/Categories${queryString ? `?${queryString}` : ''}`
  
  const response = await apiClient.get<ApiResponse<PagedList<CategoryDto>> | PagedList<CategoryDto>>(endpoint)
  
  // Handle both response formats
  if ('items' in response && 'pageIndex' in response) {
    return response as PagedList<CategoryDto>
  }
  return (response as ApiResponse<PagedList<CategoryDto>>).value!
}

export const getCategoryById = async (id: number): Promise<CategoryDto> => {
  const response = await apiClient.get<ApiResponse<CategoryDto> | CategoryDto>(`/Categories/${id}`)
  
  // Handle both response formats
  if ('id' in response && 'name' in response) {
    return response as CategoryDto
  }
  return (response as ApiResponse<CategoryDto>).value!
}

export const createCategory = async (command: CreateCategoryCommand): Promise<number> => {
  const response = await apiClient.post<ApiResponse<number> | number>('/Categories', command)
  
  // Handle both response formats
  if (typeof response === 'number') {
    return response
  }
  return (response as ApiResponse<number>).value!
}

// Helper function to get all categories (no pagination)
export const getAllCategories = async (parentId?: number): Promise<CategoryDto[]> => {
  const params: CategorySpecParams = {
    pageIndex: 1,
    pageSize: 1000, // Get all
    ...(parentId && { parentId }),
  }
  
  const result = await getCategories(params)
  return result.items
}

