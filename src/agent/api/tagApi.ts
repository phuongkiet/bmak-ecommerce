import { apiClient } from './apiClient'
import { TagDto, CreateTagCommand } from '@/models/Tag'
import { ApiResponse } from './apiClient'

// GET: /api/tags
export const getTags = async (): Promise<TagDto[]> => {
  const response = await apiClient.get<ApiResponse<TagDto[]> | TagDto[]>('/tags')
  
  // Handle both response formats
  if (Array.isArray(response)) {
    return response
  }
  return (response as ApiResponse<TagDto[]>).value || []
}

// POST: /api/tags
export const createTag = async (command: CreateTagCommand): Promise<number> => {
  const response = await apiClient.post<ApiResponse<number> | number>('/tags', command)
  
  // Handle both response formats
  if (typeof response === 'number') {
    return response
  }
  return (response as ApiResponse<number>).value || 0
}

export const updateTag = async (id: number, command: CreateTagCommand): Promise<ApiResponse<boolean>> => {
  const response = await apiClient.put<ApiResponse<boolean>>(`/tags/${id}`, command)
  if(response.isSuccess == false) {
    return { value: false, isSuccess: false, error: 'Failed to update tag' }
  }
  return { value: true, isSuccess: true } 
}

export const deleteTag = async (id: number): Promise<ApiResponse<boolean>> => {
  const response = await apiClient.delete<ApiResponse<boolean>>(`/tags/${id}`)
  if(response.isSuccess == false) {
    return { value: false, isSuccess: false, error: 'Failed to delete tag' }
  }
  return { value: true, isSuccess: true }
}

