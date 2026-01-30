import { ApiResponse, apiClient } from './apiClient'
import { WardDto } from '@/models/Ward'
type WardResult = ApiResponse<WardDto> | WardDto

const normalizeWard = (response: WardResult): WardDto => {
  return 'data' in response ? response.data : response
}

export const getWards = async (): Promise<WardDto[]> => {
  const response = await apiClient.get<any>(`/Ward`)
  
  if ('items' in response && Array.isArray(response.items)) {
    return response.items
  }
  
  if ('data' in response && Array.isArray(response.data)) {
    return response.data
  }
  
  if (Array.isArray(response)) {
    return response.map(normalizeWard)
  }
  
  return []
}

export const getWardsByProvinceId = async (provinceId: string): Promise<WardDto[]> => {
  const response = await apiClient.get<any>(`/Ward?ProvinceId=${provinceId}`)
  
  if ('items' in response && Array.isArray(response.items)) {
    return response.items
  }
  
  if ('data' in response && Array.isArray(response.data)) {
    return response.data
  }
  
  if (Array.isArray(response)) {
    return response.map(normalizeWard)
  }
  
  return []
}


