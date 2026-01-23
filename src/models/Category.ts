export interface CategoryDto {
  id: number
  name: string
  slug: string
  description?: string
  parentId?: number | null
  parentName?: string | null
  image?: string
  sortOrder?: number
  isActive?: boolean
  productCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface PagedList<T> {
  items: T[]
  pageIndex: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface CategorySpecParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  parentId?: number
  sortOrder?: string
}

export interface CreateCategoryCommand {
  name: string
  slug: string
  description?: string
  parentId?: number
  image?: string
  sortOrder?: number
  isActive?: boolean
}

