import { apiClient } from './apiClient'
import { ProvinceDto } from '@/models/Province'

export const getProvinces = async (): Promise<ProvinceDto[]> => {
  const response = await apiClient.get<any>('/Province')

  // Case: ApiResponse with paginated value: { value: { items: [...] } }
  if (response && 'value' in response && response.value && 'items' in response.value && Array.isArray(response.value.items)) {
    return response.value.items
  }

  // Case: direct paginated response: { items: [...] }
  if (response && 'items' in response && Array.isArray(response.items)) {
    return response.items
  }

  // Case: ApiResponse wrapping an array: { value: [...] }
  if (response && 'value' in response && Array.isArray(response.value)) {
    return response.value
  }

  // Case: plain array
  if (Array.isArray(response)) {
    return response
  }

  return []
}


