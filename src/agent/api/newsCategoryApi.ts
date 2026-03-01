import { apiClient, ApiResponse } from './apiClient'
import {
	NewsCategoryDto,
	CreateNewsCategoryCommand,
	UpdateNewsCategoryCommand,
} from '@/models/NewsCategory'

// GET: /api/NewsCategory
export const getNewsCategories = async (): Promise<NewsCategoryDto[]> => {
	const response = await apiClient.get<ApiResponse<NewsCategoryDto[]> | NewsCategoryDto[]>('/NewsCategories')

	if (Array.isArray(response)) {
		return response
	}

	return (response as ApiResponse<NewsCategoryDto[]>).value || []
}

// GET: /api/NewsCategory/{id}
export const getNewsCategoryById = async (id: number): Promise<NewsCategoryDto> => {
	const response = await apiClient.get<ApiResponse<NewsCategoryDto> | NewsCategoryDto>(`/NewsCategories/${id}`)

	if ('id' in response && 'name' in response) {
		return response as NewsCategoryDto
	}

	return (response as ApiResponse<NewsCategoryDto>).value!
}

// POST: /api/NewsCategory
export const createNewsCategory = async (command: CreateNewsCategoryCommand): Promise<number> => {
	const response = await apiClient.post<ApiResponse<number> | number>('/NewsCategories', command)

	if (typeof response === 'number') {
		return response
	}

	return (response as ApiResponse<number>).value || 0
}

// PUT: /api/NewsCategory/{id}
export const updateNewsCategory = async (
	id: number,
	command: UpdateNewsCategoryCommand,
): Promise<boolean> => {
	const response = await apiClient.put<ApiResponse<boolean> | boolean>(`/NewsCategories/${id}`, command)

	if (typeof response === 'boolean') {
		return response
	}

	return (response as ApiResponse<boolean>).value || false
}

// DELETE: /api/NewsCategory/{id}
export const deleteNewsCategory = async (id: number): Promise<boolean> => {
	const response = await apiClient.delete<ApiResponse<boolean> | boolean>(`/NewsCategories/${id}`)

	if (typeof response === 'boolean') {
		return response
	}

	return (response as ApiResponse<boolean>).value || false
}
