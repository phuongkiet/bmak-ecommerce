import { apiClient, ApiResponse } from './apiClient'
import { PaginatedResult } from '@/models/Common'
import {
	UserDto,
	UserSummaryDto,
	CreateNewUserRequest,
	UpdateUserRequest,
	UserSpecParams,
} from '@/models/User'

// GET /User (paged)
export const getUsers = async (
	params: Partial<UserSpecParams>
): Promise<PaginatedResult<UserSummaryDto[]>> => {
	const qp = new URLSearchParams()
	if (params.pageIndex != null) qp.append('pageIndex', String(params.pageIndex))
	if (params.pageSize != null) qp.append('pageSize', String(params.pageSize))
	if (params.search) qp.append('search', String(params.search))
	if (params.sortOrder) qp.append('sortOrder', String(params.sortOrder))

	const response = await apiClient.getWithHeaders<any>(`/User?${qp.toString()}`)
	const raw = response.data
	const body = raw && typeof raw === 'object' && 'value' in raw ? raw.value : raw

	// items
	let items: UserSummaryDto[] = []
	if (Array.isArray(body)) items = body
	else if (body && 'items' in body && Array.isArray(body.items)) items = body.items

	// pagination metadata
	const paginationHeader = response.headers.get('pagination') || response.headers.get('Pagination')
	let metaData
	if (paginationHeader) {
		try {
			const parsed = JSON.parse(paginationHeader)
			metaData = {
				currentPage: parsed.currentPage ?? parsed.pageIndex ?? parsed.pageNumber ?? params.pageIndex ?? 1,
				totalPages: parsed.totalPages ?? 0,
				itemsPerPage: parsed.itemsPerPage ?? parsed.pageSize ?? params.pageSize ?? 10,
				totalItems: parsed.totalItems ?? parsed.totalCount ?? 0,
			}
		} catch {
			metaData = {
				currentPage: params.pageIndex ?? 1,
				totalPages: 0,
				itemsPerPage: params.pageSize ?? 10,
				totalItems: 0,
			}
		}
	} else {
		metaData = {
			currentPage: (body && (body.pageIndex ?? body.pageNumber)) ?? params.pageIndex ?? 1,
			totalPages: (body && (body.totalPages ?? 0)) ?? 0,
			itemsPerPage: (body && (body.pageSize ?? params.pageSize)) ?? params.pageSize ?? 10,
			totalItems: (body && (body.totalCount ?? 0)) ?? 0,
		}
	}

	return {
		items,
		metaData,
	}
}

// GET /User/{id}
export const getUserById = async (id: number): Promise<UserDto> => {
	const response = await apiClient.get<ApiResponse<UserDto> | UserDto>(`/User/${id}`)
	if (response && typeof response === 'object' && 'id' in response && 'email' in response) {
		return response as UserDto
	}
	return (response as ApiResponse<UserDto>).value as UserDto
}

// POST /User
export const createUser = async (command: CreateNewUserRequest): Promise<number> => {
	const response = await apiClient.post<ApiResponse<number> | number>('/User', command)
	if (typeof response === 'number') return response
	return (response as ApiResponse<number>).value || 0
}

// PUT /User/{id}
export const updateUser = async (id: number, command: UpdateUserRequest): Promise<boolean> => {
	const response = await apiClient.put<ApiResponse<boolean> | boolean>(`/User/${id}`, command)
	if (typeof response === 'boolean') return response
	return (response as ApiResponse<boolean>).value ?? false
}

// DELETE /User/{id}?hardDelete=true
export const deleteUser = async (id: number, hardDelete: boolean = false): Promise<boolean> => {
	const qs = hardDelete ? '?hardDelete=true' : ''
	const response = await apiClient.delete<ApiResponse<boolean> | boolean>(`/User/${id}${qs}`)
	if (typeof response === 'boolean') return response
	return (response as ApiResponse<boolean>).value ?? false
}

export default {
	getUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
}