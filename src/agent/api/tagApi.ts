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
  return (response as ApiResponse<TagDto[]>).data || []
}

// POST: /api/tags
export const createTag = async (command: CreateTagCommand): Promise<number> => {
  const response = await apiClient.post<ApiResponse<number> | number>('/tags', command)
  
  // Handle both response formats
  if (typeof response === 'number') {
    return response
  }
  return (response as ApiResponse<number>).data
}

