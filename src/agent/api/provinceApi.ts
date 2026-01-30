import { ApiResponse, apiClient } from './apiClient'
import { ProvinceDto } from '@/models/Province'

type ProvinceResult = ApiResponse<ProvinceDto> | ProvinceDto

const normalizeProvince = (response: ProvinceResult): ProvinceDto => {
  return 'data' in response ? response.data : response
}

export const getProvinces = async (): Promise<ProvinceDto[]> => {
  const response = await apiClient.get<any>(`/Province`)
  
  // Handle case where response is wrapped in { items: [...] } (paginated response)
  if ('items' in response && Array.isArray(response.items)) {
    return response.items
  }
  
  // Handle case where response is wrapped in { data: [...] }
  if ('data' in response && Array.isArray(response.data)) {
    return response.data
  }
  
  // Handle case where response is an array
  if (Array.isArray(response)) {
    return response.map(normalizeProvince)
  }
  
  return []
}


