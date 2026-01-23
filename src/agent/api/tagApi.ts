import { apiClient } from './apiClient'
import { Tag, CreateTagCommand } from '@/models/Tag'
import { ApiResponse } from './apiClient'

// GET: /api/tags
export const getTags = async (): Promise<Tag[]> => {
  const response = await apiClient.get<ApiResponse<Tag[]> | Tag[]>('/tags')
  
  // Handle both response formats
  if (Array.isArray(response)) {
    return response
  }
  return (response as ApiResponse<Tag[]>).data || []
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

