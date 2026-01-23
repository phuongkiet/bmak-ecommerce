import { apiClient } from './apiClient'
import {
  Product,
  ProductCategory,
  TopSellingProduct,
  type ProductSpecParams,
} from '@/models/Product'
import type { ProductPagedListDto } from '@/models/ProductPaged'
import { ApiResponse } from './apiClient'

// Legacy: get all products (không paging) - nếu backend không hỗ trợ, có thể bỏ
export const getProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<ApiResponse<Product[]> | Product[]>('/products')
  if (Array.isArray(response)) {
    return response
  }
  return (response as ApiResponse<Product[]>).data || []
}

export const getProductById = async (id: number): Promise<Product> => {
  const response = await apiClient.get<ApiResponse<Product> | Product>(`/products/${id}`)
  // Handle both response formats
  if ('id' in response && 'name' in response) {
    return response as Product
  }
  return (response as ApiResponse<Product>).data
}

export const getProductsByCategory = async (categoryId: number): Promise<Product[]> => {
  const response = await apiClient.get<ApiResponse<Product[]> | Product[]>(`/products?categoryId=${categoryId}`)
  // Handle both response formats
  if (Array.isArray(response)) {
    return response
  }
  return (response as ApiResponse<Product[]>).data || []
}

export const searchProducts = async (query: string): Promise<Product[]> => {
  const response = await apiClient.get<ApiResponse<Product[]> | Product[]>(`/products/search?q=${encodeURIComponent(query)}`)
  // Handle both response formats
  if (Array.isArray(response)) {
    return response
  }
  return (response as ApiResponse<Product[]>).data || []
}

export const getProductCategories = async (): Promise<ProductCategory[]> => {
  const response = await apiClient.get<ApiResponse<ProductCategory[]> | ProductCategory[]>('/categories')
  // Handle both response formats
  if (Array.isArray(response)) {
    return response
  }
  return (response as ApiResponse<ProductCategory[]>).data || []
}

export const getProductsByTag = async (tag: string): Promise<Product[]> => {
  const paged = await getProductsPaged({ tag, pageIndex: 1, pageSize: 20 })
  // Map về Product đơn giản cho FE
  return paged.items.map((p) => ({
    id: p.id,
    name: p.name,
    description: '',
    price: p.salePrice,
    image: p.imageUrl || '/placeholder-product.png',
    categoryName: p.categoryName,
    categorySlug: p.categorySlug,
    tag: p.tag,
  }))
}

export const getTopSellingProducts = async (): Promise<TopSellingProduct[]> => {
  const response = await apiClient.get<ApiResponse<TopSellingProduct[]> | TopSellingProduct[]>('/products/top-selling')
  // Handle both response formats
  if (Array.isArray(response)) {
    return response
  }
  return (response as ApiResponse<TopSellingProduct[]>).data || []
}

// New: GET /api/products với paging & filter
export const getProductsPaged = async (
  params: ProductSpecParams
): Promise<ProductPagedListDto> => {
  const query = new URLSearchParams()

  if (params.pageIndex != null) query.append('pageIndex', String(params.pageIndex))
  if (params.pageSize != null) query.append('pageSize', String(params.pageSize))
  if (params.sort) query.append('sort', params.sort)
  if (params.attributes) query.append('attributes', params.attributes)
  if (params.search) query.append('search', params.search)
  if (params.categoryId != null) query.append('categoryId', String(params.categoryId))
  if (params.tag) query.append('tag', params.tag)

  return apiClient.get<ProductPagedListDto>(`/products?${query.toString()}`)
}

// POST: /api/products
export const createProduct = async (
  command: import('@/models/Product').CreateProductCommand
): Promise<number> => {
  const response = await apiClient.post<ApiResponse<number> | number>('/products', command)
  
  // Handle both response formats
  if (typeof response === 'number') {
    return response
  }
  return (response as ApiResponse<number>).data
}

