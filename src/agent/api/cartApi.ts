import { ShoppingCart } from '@/models/Cart'
import { ApiResponse, apiClient } from './apiClient'

type CartResult = ApiResponse<ShoppingCart> | ShoppingCart

const normalizeCart = (response: CartResult): ShoppingCart => {
  return 'data' in response ? response.data : response
}

export interface AddToCartPayload {
  /** Backend expects this `id` query/body field for the current cart (e.g., guest token). */
  id: string
  /** Some backends name this property `CartId`; send both to be safe. */
  cartId?: string
  productId: number
  quantity: number
}

export const getCart = async (id: string): Promise<ShoppingCart> => {
  const response = await apiClient.get<CartResult>(`/Cart?id=${encodeURIComponent(id)}`)
  return normalizeCart(response)
}

export const addToCart = async (payload: AddToCartPayload): Promise<ShoppingCart> => {
  const body = {
    id: payload.id,
    cartId: payload.cartId ?? payload.id,
    productId: payload.productId,
    quantity: payload.quantity,
  }
  const response = await apiClient.post<CartResult>(
    `/Cart?id=${encodeURIComponent(payload.id)}`,
    body
  )
  return normalizeCart(response)
}

export const clearCart = async (id: string): Promise<ShoppingCart> => {
  const response = await apiClient.delete<CartResult>(`/Cart?cartId=${encodeURIComponent(id)}`)
  return normalizeCart(response)
}

export const updateCartItem = async (
  id: string,
  productId: number,
  quantity: number
): Promise<ShoppingCart> => {
  const body = {
    cartId: id,
    productId,
    quantity,
  }
  const response = await apiClient.put<CartResult>(
    `/Cart?cartId=${encodeURIComponent(id)}`,
    body
  )
  return normalizeCart(response)
}

export const deleteCartItem = async (
  id: string,
  productId: number
): Promise<ShoppingCart> => {
  const response = await apiClient.put<CartResult>(
    `/Cart/item?cartId=${encodeURIComponent(id)}&productId=${productId}`
  )
  return normalizeCart(response)
} 

