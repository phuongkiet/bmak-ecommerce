import { apiClient } from './apiClient'
import {
  ProductDto,
  ProductCategory,
  TopSellingProduct,
  ProductListResponse,
} from '@/models/Product'
import { ProductSpecParamsBuilder, type ProductSpecParams } from '@/models/common/ProductSpecParams'
import { ApiResponse } from './apiClient'

const normalizeProductsArray = (rawResponse: unknown): ProductDto[] => {
  const unwrapApiResponse =
    rawResponse && typeof rawResponse === 'object' && 'value' in (rawResponse as Record<string, unknown>)
      ? (rawResponse as ApiResponse<unknown>).value
      : rawResponse

  if (Array.isArray(unwrapApiResponse)) {
    return unwrapApiResponse as ProductDto[]
  }

  if (
    unwrapApiResponse &&
    typeof unwrapApiResponse === 'object' &&
    'items' in (unwrapApiResponse as Record<string, unknown>) &&
    Array.isArray((unwrapApiResponse as { items: unknown[] }).items)
  ) {
    return (unwrapApiResponse as { items: ProductDto[] }).items
  }

  if (
    unwrapApiResponse &&
    typeof unwrapApiResponse === 'object' &&
    'products' in (unwrapApiResponse as Record<string, unknown>)
  ) {
    const productsNode = (unwrapApiResponse as { products?: unknown }).products

    if (Array.isArray(productsNode)) {
      return productsNode as ProductDto[]
    }

    if (
      productsNode &&
      typeof productsNode === 'object' &&
      'items' in (productsNode as Record<string, unknown>) &&
      Array.isArray((productsNode as { items: unknown[] }).items)
    ) {
      return (productsNode as { items: ProductDto[] }).items
    }
  }

  return []
}

// Legacy: get all products (không paging) - nếu backend không hỗ trợ, có thể bỏ
export const getProducts = async (): Promise<ProductDto[]> => {
  const response = await apiClient.get<unknown>('/products')
  return normalizeProductsArray(response)
}

export const getProductById = async (id: number): Promise<ProductDto> => {
  const response = await apiClient.get<ApiResponse<ProductDto> | ProductDto>(`/products/${id}`)
  // Handle both response formats
  if ('id' in response && 'name' in response) {
    return response as ProductDto
  }
  return (response as ApiResponse<ProductDto>).value || {} as ProductDto
}

export const getProductsByCategory = async (categoryId: number): Promise<ProductDto[]> => {
  const response = await apiClient.get<unknown>(`/products?categoryId=${categoryId}`)
  return normalizeProductsArray(response)
}

export const searchProducts = async (query: string): Promise<ProductDto[]> => {
  const response = await apiClient.get<unknown>(`/products/search?q=${encodeURIComponent(query)}`)
  return normalizeProductsArray(response)
}

export const getProductCategories = async (): Promise<ProductCategory[]> => {
  const response = await apiClient.get<ApiResponse<ProductCategory[]> | ProductCategory[]>('/categories')
  // Handle both response formats
  if (Array.isArray(response)) {
    return response
  }
  return (response as ApiResponse<ProductCategory[]>).value || []
}

// export const getProductsByTag = async (tag: string): Promise<ProductDto[]> => {
//   const paged = await getProductsPaged({ tag, pageIndex: 1, pageSize: 20 })
//   // Map về Product đơn giản cho FE
//   return paged.items.map((p) => ({
//     id: p.id,
//     name: p.name,
//     description: '',
//     price: p.salePrice,
//     image: p.imageUrl || '/placeholder-product.png',
//     categoryName: p.categoryName,
//     categorySlug: p.categorySlug,
//     tag: p.tag,
//   }))
// }

export const getTopSellingProducts = async (): Promise<TopSellingProduct[]> => {
  const response = await apiClient.get<ApiResponse<TopSellingProduct[]> | TopSellingProduct[]>('/products/top-selling')
  // Handle both response formats
  if (Array.isArray(response)) {
    return response
  }
  return (response as ApiResponse<TopSellingProduct[]>).value || []
}

// New: GET /api/products với paging & filter
// Backend trả về ProductListResponse với products (có pagination) và filters
export const getProductsPaged = async (
  params: Partial<ProductSpecParams>
): Promise<ProductListResponse> => {
  // Sử dụng ProductSpecParamsBuilder để format query params đúng
  const builder = new ProductSpecParamsBuilder(params)
  const query = builder.toURLSearchParams()

  const response = await apiClient.get<ApiResponse<ProductListResponse> | ProductListResponse>(
    `/products?${query.toString()}`
  )

  // Response từ backend bao gồm:
  // - products: { items: ProductSummaryDto[], pageIndex, pageSize, totalCount, totalPages }
  // - filters: { minPrice, maxPrice, attributes: FilterGroupDto[] }
  // Có thể bọc trong ApiResponse { value, isSuccess, message }
  if ('value' in (response as ApiResponse<ProductListResponse>)) {
    return (response as ApiResponse<ProductListResponse>).value as ProductListResponse
  }

  return response as ProductListResponse
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
  return (response as ApiResponse<number>).value || 0
}

// PUT: /api/products/{id}
export const updateProduct = async (
  id: number,
  command: import('@/models/Product').UpdateProductCommand & { id?: number; categoryIds?: number[] }
): Promise<number> => {
  const response = await apiClient.put<ApiResponse<number> | number>(`/products/${id}`, command)

  if (typeof response === 'number') {
    return response
  }
  return (response as ApiResponse<number>).value || 0
}

