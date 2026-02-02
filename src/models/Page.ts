/**
 * Entity & DTOs cho Page Management
 * Match với backend C# API
 */

// ============================================
// ENUMS
// ============================================
export enum PageStatusType {
  Draft = 'Draft',
  Published = 'Published',
  Archived = 'Archived'
}

// ============================================
// HERO SLIDE DTO
// ============================================
export interface HeroSlideDto {
  id: string
  image: string
  title: string
  subtitle?: string
  badge?: string
  buttonText?: string
  buttonLink?: string
}

// ============================================
// PRODUCT CAROUSEL CONFIG DTO
// ============================================
export interface ProductCarouselConfigDto {
  listType: 'tag' | 'category' | 'newest' | 'bestseller' | 'featured'
  title: string
  tag?: string
  limit?: number
}

// ============================================
// PAGE SECTION DTO
// ============================================
export interface PageSectionDto {
  id: string
  type: 'hero' | 'text' | 'image' | 'text-image' | 'product-carousel'
  content?: string
  imageUrl?: string
  imagePosition?: 'left' | 'right'
  heroSlides?: HeroSlideDto[]
  carouselConfig?: ProductCarouselConfigDto
}

// ============================================
// PAGE DTO (Chi tiết page)
// ============================================
export interface PageDto {
  id: number
  title: string
  slug: string
  description?: string
  sections: PageSectionDto[]
  status: PageStatusType
  createdAt: string
  updatedAt?: string
}

// ============================================
// PAGE SUMMARY DTO (Danh sách page)
// ============================================
export interface PageSummaryDto {
  id: number
  title: string
  slug: string
  description?: string
  status: PageStatusType
  updatedAt: string
}

// ============================================
// COMMANDS
// ============================================

/**
 * Lệnh tạo page mới
 */
export interface CreatePageCommand {
  title: string
  slug: string
  description?: string
  sections: PageSectionDto[]
}

/**
 * Lệnh cập nhật page
 */
export interface UpdatePageCommand {
  id: number
  title: string
  slug: string
  description?: string
  sections: PageSectionDto[]
  isPublished?: PageStatusType
}

// ============================================
// QUERY PARAMS
// ============================================

/**
 * Tham số truy vấn danh sách page
 */
export interface GetPageParams {
  pageIndex?: number
  pageSize?: number
  sort?: string
  search?: string
}

// ============================================
// RESPONSE TYPES (dành cho API)
// ============================================

/**
 * Response từ GET /api/page (danh sách)
 */
export interface GetPagesResponse {
  items: PageSummaryDto[]
  pageIndex: number
  pageSize: number
  totalCount: number
  totalPages: number
}

/**
 * Response từ GET /api/page/{slug} (chi tiết)
 */
export interface GetPageDetailResponse {
  data: PageDto
}

/**
 * Response từ POST /api/page (tạo)
 */
export interface CreatePageResponse {
  slug: string
}

/**
 * Response từ PUT /api/page (cập nhật)
 */
export interface UpdatePageResponse {
  id: number
}
