import { apiClient, ApiResponse } from './apiClient'
import { GetAttributeValuesQuery, ProductAttributeValueDto } from '@/models/Attribute'

// GET: /api/ProductAttributeValues?attributeId=1
export const getAttributeValues = async (
	query: GetAttributeValuesQuery,
): Promise<ProductAttributeValueDto[]> => {
	const params = new URLSearchParams()
	params.append('AttributeId', String(query.attributeId))

	const response = await apiClient.get<
		ApiResponse<ProductAttributeValueDto[]> | ProductAttributeValueDto[]
	>(`/ProductAttributeValue?${params.toString()}`)

	if (Array.isArray(response)) {
		return response
	}

	return (response as ApiResponse<ProductAttributeValueDto[]>).value || []
}

export const getAttributeValuesByAttributeId = async (
	attributeId: number,
): Promise<ProductAttributeValueDto[]> => {
	return getAttributeValues({ attributeId })
}

