import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import { ProductDto, ProductSummaryDto, TopSellingProduct, type ProductSpecParams } from '@/models/Product'
import { ProductFilterAggregationDto } from '@/models/Filter'
import * as productApi from '@/agent/api/productApi'

class ProductStore {
  products: ProductDto[] = []
  productSummaries: ProductSummaryDto[] = [] // Danh sách ProductSummaryDto từ API mới
  filters: ProductFilterAggregationDto | null = null // Filter aggregation từ backend
  topSellingProducts: TopSellingProduct[] = []
  selectedProduct: ProductDto | null = null
  isLoading: boolean = false
  error: string | null = null
  
  // Pagination info
  pageIndex: number = 1
  pageSize: number = 10
  totalCount: number = 0
  totalPages: number = 0
  
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  // Lấy minPrice từ filters aggregation (backend tính sẵn)
  get minPrice() {
    return this.filters?.minPrice ?? 0;
  }

  // Lấy maxPrice từ filters aggregation (backend tính sẵn)
  get maxPrice() {
    return this.filters?.maxPrice ?? 0;
  }

  // Lấy available attributes từ filters (backend đã aggregate sẵn với count)
  get availableAttributes() {
    if (!this.filters?.attributes) {
      return [];
    }
    return this.filters.attributes;
  }

  // Helper: Lấy filter options theo attribute code
  getFilterOptions(code: string) {
    return this.filters?.attributes.find(attr => attr.code === code)?.options ?? [];
  }

  async fetchProducts(): Promise<void> {
    this.isLoading = true
    this.error = null
    
    try {
      const data = await productApi.getProducts()
      runInAction(() => {
        this.products = data
        this.isLoading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to fetch products'
        this.isLoading = false
      })
    }
  }

  // Lấy products dùng endpoint paging với filters
  async fetchProductsPaged(params: Partial<ProductSpecParams>): Promise<void> {
    this.isLoading = true
    this.error = null

    try {
      const response = await productApi.getProductsPaged(params)
      runInAction(() => {
        // Lưu ProductSummaryDto trực tiếp từ backend
        this.productSummaries = response.products.items
        
        // Lưu pagination info
        this.pageIndex = response.products.pageIndex
        this.pageSize = response.products.pageSize
        this.totalCount = response.products.totalCount
        this.totalPages = response.products.totalPages
        
        // Lưu filters (minPrice, maxPrice, attributes)
        this.filters = response.filters
        
        this.isLoading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to fetch products'
        this.isLoading = false
      })
    }
  }

  async fetchProductById(id: number): Promise<void> {
    this.isLoading = true
    this.error = null
    
    try {
      const data = await productApi.getProductById(id)
      runInAction(() => {
        this.selectedProduct = data
        console.log("Fetched product:", data)
        this.isLoading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to fetch product'
        this.isLoading = false
      })
    }
  }

  clearSelectedProduct(): void {
    this.selectedProduct = null
  }

  // Cache for products by tag
  private productsByTag: Map<string, ProductDto[]> = new Map()
  // private loadingTags: Set<string> = new Set()

  getProductsByTag(tag: string): ProductDto[] {
    return this.productsByTag.get(tag) || []
  }

  async loadProducts(params: Partial<ProductSpecParams>): Promise<ProductSummaryDto[]> {
    try {
      const response = await productApi.getProductsPaged(params)
      
      runInAction(() => {
        // Cập nhật store state
        this.productSummaries = response.products.items
        this.filters = response.filters
        this.pageIndex = response.products.pageIndex
        this.pageSize = response.products.pageSize
        this.totalCount = response.products.totalCount
        this.totalPages = response.products.totalPages
      })

      return response.products.items
    } catch (error) {
      console.error("Error loading products:", error)
      return [] // Trả về mảng rỗng để UI không bị crash
    }
  }

  async getTopSelling(): Promise<ProductDto[]> {
    try {
      const data = await productApi.getTopSellingProducts()
      
      runInAction(() => {
        this.topSellingProducts = data
      })

      // Map TopSellingProduct -> ProductDto (để tái sử dụng component Product Card)
      return data.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        slug: p.slug,
        price: p.price,
        originalPrice: p.originalPrice,
        thumbnail: p.thumbnail,
        // Các trường không có trong response -> set mặc định
        salesUnit: '',
        priceUnit: '',
        conversionFactor: 1,
        stockQuantity: 0,
        images: [],
        attributes: [],
        categoryId: 0,
        categoryName: '',
      }))
    } catch (error) {
      console.error("Error loading top selling:", error)
      return []
    }
  }

  // // --- LOGIC TAG (Đã tối ưu) ---
  // async fetchProductsByTag(tag: string): Promise<Product[]> {
  //   // 1. Trả về cache nếu có
  //   if (this.productsByTag.has(tag)) {
  //     return this.productsByTag.get(tag)!
  //   }

  //   // 2. Chặn duplicate request
  //   if (this.loadingTags.has(tag)) {
  //     return [] 
  //   }

  //   this.loadingTags.add(tag)
    
  //   try {
  //     const data = await productApi.getProductsByTag(tag)
  //     runInAction(() => {
  //       this.productsByTag.set(tag, data)
  //       this.loadingTags.delete(tag)
  //     })
  //     return data
  //   } catch (error) {
  //     runInAction(() => {
  //       this.loadingTags.delete(tag)
  //     })
  //     return []
  //   }
  // }

  clearTagCache(tag?: string): void {
    if (tag) {
      this.productsByTag.delete(tag)
    } else {
      this.productsByTag.clear()
    }
  }

  async createProduct(command: import('@/models/Product').CreateProductCommand): Promise<number> {
    this.isLoading = true
    this.error = null

    try {
      const productId = await productApi.createProduct(command)
      runInAction(() => {
        this.isLoading = false
      })
      return productId
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to create product'
        this.isLoading = false
      })
      throw error
    }
  }
}

export default ProductStore

