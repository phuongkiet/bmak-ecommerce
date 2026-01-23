// Basic product model dùng trong FE (map từ DTO backend)
export interface Product {
  id: number
  name: string
  description?: string
  // Giá hiển thị (có thể = salePrice)
  price: number
  // Ảnh chính
  image: string
  // Ảnh phụ
  images?: string[]
  categoryId?: number
  categoryName?: string
  categorySlug?: string
  tag?: string
  stock?: number
  rating?: number
  reviewCount?: number
  weight?: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ProductCategory {
  id: number
  name: string
  slug: string
  description?: string
}

// ----- DTOs khớp với backend -----

// Attribute khi tạo/cập nhật sản phẩm
export interface ProductAttributeCreateDto {
  attributeId: number
  value: string
  extraData?: string
}

// Attribute trả về trong PagedList<ProductDto>
export interface ProductAttributeDto {
  name: string
  value: string
  code: string
}

// Command tạo sản phẩm (POST: /api/products)
export interface CreateProductCommand {
  name: string
  sku: string
  basePrice: number
  salePrice: number
  salesUnit: string
  priceUnit: string
  conversionFactor: number
  categoryId: number
  weight: number
  imageUrl: string
  specificationsJson?: string
  isActive: boolean
  tag?: string
  saleStartDate?: string // ISO date string
  saleEndDate?: string // ISO date string
  attributes: ProductAttributeCreateDto[]
}

// Item trong PagedList<ProductDto> của GET: /api/products
export interface ProductListItemDto {
  id: number
  name: string
  sku: string
  slug: string
  salePrice: number
  imageUrl: string | null
  categoryName: string
  categorySlug: string
  tag?: string
  attributes: ProductAttributeDto[]
}

// Tham số query cho GET: /api/products
// ví dụ ?pageIndex=1&pageSize=10&sort=priceAsc&attributes=size:60x60
export interface ProductSpecParams {
  pageIndex?: number
  pageSize?: number
  sort?: string
  attributes?: string
  search?: string
  categoryId?: number
  tag?: string
}

export interface TopSellingProduct {
  id: number
  name: string
  sku: string | null
  slug: string | null
  basePrice: number
  salePrice: number
  totalSold: number
  saleStartDate: string | null
  saleEndDate: string | null
  imageUrl: string | null
  categoryName: string | null
  categorySlug: string | null
  attributes: ProductAttributeDto[] | null
  tags: string | null
}

