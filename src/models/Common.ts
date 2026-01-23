// Interface hứng Header Pagination từ BE
export interface MetaData {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

// Wrapper cho kết quả phân trang
export interface PaginatedResult<T> {
  items: T;
  metaData: MetaData;
}