import { apiClient, ApiResponse } from './apiClient'
import { CreateRoomSceneCommand, RoomSceneDto, UpdateRoomSceneCommand } from '@/models/RoomScene'

function unwrap<T>(response: ApiResponse<T> | T): T {
  if (
    response &&
    typeof response === 'object' &&
    'value' in (response as Record<string, unknown>)
  ) {
    return (response as ApiResponse<T>).value as T
  }
  return response as T
}

export const getRoomScenes = async (): Promise<RoomSceneDto[]> => {
  const res = await apiClient.get<ApiResponse<RoomSceneDto[]> | RoomSceneDto[]>('/admin/room-scenes')
  return unwrap(res) ?? []
}

export const getRoomSceneById = async (id: number): Promise<RoomSceneDto> => {
  const res = await apiClient.get<ApiResponse<RoomSceneDto> | RoomSceneDto>(`/admin/room-scenes/${id}`)
  return unwrap(res)
}

export const createRoomScene = async (command: CreateRoomSceneCommand): Promise<number> => {
  const res = await apiClient.post<ApiResponse<number> | number>('/admin/room-scenes', command)
  return unwrap(res) ?? 0
}

export const updateRoomScene = async (command: UpdateRoomSceneCommand): Promise<boolean> => {
  const res = await apiClient.put<ApiResponse<boolean> | boolean>(
    `/admin/room-scenes/${command.id}`,
    command,
  )
  return Boolean(unwrap(res))
}

export const deleteRoomScene = async (id: number): Promise<boolean> => {
  const res = await apiClient.delete<ApiResponse<boolean> | boolean>(`/admin/room-scenes/${id}`)
  return Boolean(unwrap(res))
}
