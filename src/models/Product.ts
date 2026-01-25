import { PagedList } from "./Category";
import { ProductFilterAggregationDto } from "./Filter";
import { ProductAttributeCreateDto, ProductAttributeDto } from "./ProductAttribute";
import { ProductImageDto } from "./ProductImage";

// Basic product DTO (map từ backend)
export interface ProductDto {
  id: number;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string;
  description?: string;
  specificationsJson?: string; // JSON thông số kỹ thuật
  salesUnit: string; // "Thùng", "Viên"
  priceUnit: string; // "m2", "Viên"
  conversionFactor: number; // Hệ số quy đổi (VD: 0.36)

  // Giá & Kho
  price: number; // SalePrice
  originalPrice?: number; // BasePrice
  stockQuantity: number;

  // Hình ảnh
  thumbnail?: string;
  images: ProductImageDto[];

  // Thuộc tính hiển thị
  attributes: ProductAttributeDto[];

  // Danh mục
  categoryId: number;
  categoryName: string;
}

export interface ProductCategory {
  id: number
  name: string
  slug: string
  description?: string
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
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  thumbnail: string;
  badges: string[];
  keySpecs: Record<string, string>;
  rating: number;
  reviewCount: number;
  totalSold: number;
}

// DTO Tóm tắt sản phẩm (dùng cho hiển thị nhanh, ví dụ: carousel, list view)
export interface ProductSummaryDto {
  id: number;
  name: string;
  slug: string; // Để tạo link SEO
  sku: string;

  // --- Pricing (Xử lý hiển thị giá) ---
  price: number; // Giá bán thực tế (đã giảm)
  originalPrice?: number; // Giá gốc (để gạch ngang)

  // --- Visual ---
  thumbnail: string; // Ảnh đại diện

  // --- Badges (Để FE hiển thị nhãn) ---
  badges: string[]; // Ví dụ: ["Mới", "Bán chạy", "-20%"]

  // --- Key Specs (Quan trọng) ---
  keySpecs: Record<string, string>; // Dictionary<string, string>

  // --- Social Proof ---
  rating: number; // 4.5
  reviewCount: number; // (120)
  totalSold: number; // Đã bán 1k
}

// Response từ GET /api/products - Bao gồm cả products và filters
export interface ProductListResponse {
  products: PagedList<ProductSummaryDto>; // List sản phẩm + pagination info
  filters: ProductFilterAggregationDto;   // Aggregated filter options
}

