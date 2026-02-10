import { apiClient } from './apiClient'
import { Attribute, CreateAttributeCommand } from '@/models/Attribute'
import { ApiResponse } from './apiClient'

// GET: /api/attributes
export const getAttributes = async (): Promise<Attribute[]> => {
  const response = await apiClient.get<ApiResponse<Attribute[]> | Attribute[]>('/ProductAttributes')
  
  // Handle both response formats
  if (Array.isArray(response)) {
    return response
  }
  return (response as ApiResponse<Attribute[]>).value || []
}

// POST: /api/attributes
export const createAttribute = async (command: CreateAttributeCommand): Promise<number> => {
  const response = await apiClient.post<ApiResponse<number> | number>('/ProductAttributes', command)
  
  // Handle both response formats
  if (typeof response === 'number') {
    return response
  }
  return (response as ApiResponse<number>).value || 0
}

