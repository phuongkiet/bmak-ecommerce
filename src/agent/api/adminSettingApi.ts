import { apiClient, ApiResponse } from './apiClient'
import type { AdminSettingDto, UpsertAdminSettingCommand } from '@/models/AdminSetting'

const unwrapApiResponse = <T>(response: ApiResponse<T> | T): T => {
  if (response && typeof response === 'object' && 'isSuccess' in response) {
    const wrapped = response as ApiResponse<T>
    if (!wrapped.isSuccess || wrapped.value === undefined) {
      throw new Error(wrapped.error || 'Yêu cầu thất bại')
    }
    return wrapped.value
  }

  return response as T
}

export const getAdminSetting = async (): Promise<AdminSettingDto> => {
  const response = await apiClient.get<ApiResponse<AdminSettingDto> | AdminSettingDto>('/admin/settings')
  return unwrapApiResponse(response)
}

export const upsertAdminSetting = async (
  command: UpsertAdminSettingCommand,
): Promise<AdminSettingDto> => {
  const response = await apiClient.put<ApiResponse<AdminSettingDto> | AdminSettingDto>(
    '/admin/settings',
    command,
  )

  return unwrapApiResponse(response)
}
