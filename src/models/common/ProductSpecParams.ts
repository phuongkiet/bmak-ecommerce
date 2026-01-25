const MAX_PAGE_SIZE = 50;

export interface ProductSpecParams {
  // --- PAGINATION ---
  pageIndex: number; // FIX: Đổi PageIndex -> pageIndex để khớp với Repository và chuẩn API
  pageSize: number;

  // --- SEARCH & FILTER ---
  search?: string;

  // FIX: Thêm categorySlug để lọc theo Slug (SEO friendly URL)
  categorySlug?: string;
  categoryId?: number; // Giữ lại nếu cần lọc nội bộ theo ID

  // --- PRICE RANGE ---
  minPrice?: number;
  maxPrice?: number;

  // --- SORTING ---
  sort?: string;

  // --- FILTER ATTRIBUTES (DYNAMIC) ---
  color?: string;
  size?: string;
  brand?: string;

  // --- FILTER TAGS ---
  tagIdsString?: string; // Dạng string: "1,2,3"
}

/**
 * Helper class để handle ProductSpecParams với default values và validation
 */
export class ProductSpecParamsBuilder {
  private params: ProductSpecParams;

  constructor(params?: Partial<ProductSpecParams>) {
    this.params = {
      pageIndex: params?.pageIndex ?? 1,
      pageSize: this.validatePageSize(params?.pageSize ?? 10),
      search: params?.search,
      categorySlug: params?.categorySlug,
      categoryId: params?.categoryId,
      minPrice: params?.minPrice,
      maxPrice: params?.maxPrice,
      sort: params?.sort,
      color: params?.color,
      size: params?.size,
      brand: params?.brand,
      tagIdsString: params?.tagIdsString,
    };
  }

  /**
   * Validate và giới hạn pageSize không vượt quá MAX_PAGE_SIZE
   */
  private validatePageSize(size: number): number {
    return size > MAX_PAGE_SIZE ? MAX_PAGE_SIZE : size;
  }

  /**
   * Parse tagIdsString thành array số
   * Ví dụ: "1,2,3" -> [1, 2, 3]
   */
  getTagIds(): number[] {
    if (!this.params.tagIdsString) return [];
    return this.params.tagIdsString
      .split(',')
      .map((id) => {
        const parsed = parseInt(id.trim(), 10);
        return !isNaN(parsed) ? parsed : null;
      })
      .filter((id) => id !== null) as number[];
  }

  /**
   * Convert params thành URLSearchParams để gửi API
   */
  toURLSearchParams(): URLSearchParams {
    const params = new URLSearchParams();

    if (this.params.pageIndex) params.append('pageIndex', this.params.pageIndex.toString());
    if (this.params.pageSize) params.append('pageSize', this.params.pageSize.toString());
    if (this.params.search) params.append('search', this.params.search);
    if (this.params.categorySlug) params.append('categorySlug', this.params.categorySlug);
    if (this.params.categoryId) params.append('categoryId', this.params.categoryId.toString());
    if (this.params.minPrice !== undefined) params.append('minPrice', this.params.minPrice.toString());
    if (this.params.maxPrice !== undefined) params.append('maxPrice', this.params.maxPrice.toString());
    if (this.params.sort) params.append('sort', this.params.sort);
    if (this.params.color) params.append('color', this.params.color);
    if (this.params.size) params.append('size', this.params.size);
    if (this.params.brand) params.append('brand', this.params.brand);
    if (this.params.tagIdsString) params.append('tagIdsString', this.params.tagIdsString);

    return params;
  }

  /**
   * Get raw params object
   */
  build(): ProductSpecParams {
    return this.params;
  }
}
