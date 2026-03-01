import { apiClient, ApiResponse } from './apiClient'
import {
	NewsPostDto,
	NewsPostSummaryDto,
	CreateNewsPostCommand,
	UpdateNewsPostCommand,
} from '@/models/NewsPost'

// GET: /api/NewsPost
export const getNewsPosts = async (): Promise<NewsPostSummaryDto[]> => {
	const response = await apiClient.get<ApiResponse<NewsPostSummaryDto[]> | NewsPostSummaryDto[]>('/NewsPosts')

	if (Array.isArray(response)) {
		return response
	}

	return (response as ApiResponse<NewsPostSummaryDto[]>).value || []
}

// GET: /api/NewsPost/{id}
export const getNewsPostById = async (id: number): Promise<NewsPostDto> => {
	const response = await apiClient.get<ApiResponse<NewsPostDto> | NewsPostDto>(`/NewsPosts/${id}`)

	if ('id' in response && 'title' in response) {
		return response as NewsPostDto
	}

	return (response as ApiResponse<NewsPostDto>).value!
}

// POST: /api/NewsPost
export const createNewsPost = async (command: CreateNewsPostCommand): Promise<number> => {
	const response = await apiClient.post<ApiResponse<number> | number>('/NewsPosts', command)

	if (typeof response === 'number') {
		return response
	}

	return (response as ApiResponse<number>).value || 0
}

// PUT: /api/NewsPost/{id}
export const updateNewsPost = async (
	id: number,
	command: UpdateNewsPostCommand,
): Promise<boolean> => {
	const response = await apiClient.put<ApiResponse<boolean> | boolean>(`/NewsPosts/${id}`, command)

	if (typeof response === 'boolean') {
		return response
	}

	return (response as ApiResponse<boolean>).value || false
}

// DELETE: /api/NewsPost/{id}
export const deleteNewsPost = async (id: number): Promise<boolean> => {
	const response = await apiClient.delete<ApiResponse<boolean> | boolean>(`/NewsPosts/${id}`)

	if (typeof response === 'boolean') {
		return response
	}

	return (response as ApiResponse<boolean>).value || false
}
