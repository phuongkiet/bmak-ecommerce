import { apiClient } from './apiClient'
import { CartItem } from '@/models/CartItem'
import { ApiResponse } from './apiClient'

export const getCart = async (): Promise<CartItem[]> => {
  const response = await apiClient.get<ApiResponse<CartItem[]> | CartItem[]>('/cart')
  // Handle both response formats
  if (Array.isArray(response)) {
    return response
  }
  return (response as ApiResponse<CartItem[]>).data || []
}

export const addToCart = async (productId: number, quantity: number): Promise<CartItem> => {
  const response = await apiClient.post<ApiResponse<CartItem> | CartItem>('/cart', {
    productId,
    quantity,
  })
  // Handle both response formats
  if ('id' in response && 'productId' in response) {
    return response as CartItem
  }
  return (response as ApiResponse<CartItem>).data
}

export const updateCartItem = async (itemId: number, quantity: number): Promise<CartItem> => {
  const response = await apiClient.put<ApiResponse<CartItem> | CartItem>(`/cart/${itemId}`, {
    quantity,
  })
  // Handle both response formats
  if ('id' in response && 'productId' in response) {
    return response as CartItem
  }
  return (response as ApiResponse<CartItem>).data
}

export const removeFromCart = async (itemId: number): Promise<void> => {
  await apiClient.delete(`/cart/${itemId}`)
}

export const clearCart = async (): Promise<void> => {
  await apiClient.delete('/cart')
}

