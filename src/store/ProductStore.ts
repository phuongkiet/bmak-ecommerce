import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import { Product, TopSellingProduct, type ProductListItemDto, type ProductSpecParams } from '@/models/Product'
import * as productApi from '@/agent/api/productApi'

class ProductStore {
  products: Product[] = []
  topSellingProducts: TopSellingProduct[] = []
  selectedProduct: Product | null = null
  isLoading: boolean = false
  error: string | null = null
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
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

  // Lấy products dùng endpoint paging cho admin
  async fetchProductsPaged(params: ProductSpecParams): Promise<void> {
    this.isLoading = true
    this.error = null

    try {
      const paged = await productApi.getProductsPaged(params)
      runInAction(() => {
        // Map ProductListItemDto -> Product model dùng trong FE
        this.products = paged.items.map((p: ProductListItemDto): Product => ({
          id: p.id,
          name: p.name,
          description: '', // BE list không trả mô tả ngắn
          price: p.salePrice,
          image: p.imageUrl || '/placeholder-product.png',
          categoryName: p.categoryName,
          categorySlug: p.categorySlug,
        }))
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
  private productsByTag: Map<string, Product[]> = new Map()
  private loadingTags: Set<string> = new Set()

  getProductsByTag(tag: string): Product[] {
    return this.productsByTag.get(tag) || []
  }

  async loadProducts(params: ProductSpecParams): Promise<Product[]> {
    try {
      const paged = await productApi.getProductsPaged(params)
      
      // Map DTO sang Model ngay tại Store để UI đỡ phải map
      const mappedProducts: Product[] = paged.items.map((p: ProductListItemDto) => ({
        id: p.id,
        name: p.name,
        description: '', 
        price: p.salePrice,
        image: p.imageUrl || '/placeholder-product.png', // Fallback ảnh
        categoryName: p.categoryName,
        categorySlug: p.categorySlug,
        // Nếu API có trả về rating/originalPrice thì map thêm vào đây
      }))

      return mappedProducts
    } catch (error) {
      console.error("Error loading products:", error)
      return [] // Trả về mảng rỗng để UI không bị crash
    }
  }

  async getTopSelling(): Promise<Product[]> {
    try {
      const data = await productApi.getTopSellingProducts()
      
      runInAction(() => {
        this.topSellingProducts = data
      })

      // Map TopSellingProduct -> Product (để tái sử dụng component Product Card)
      return data.map(p => ({
        id: p.id,
        name: p.name,
        price: p.salePrice,
        image: p.imageUrl || '/placeholder-product.png',
        description: '',
        categoryName: p.categoryName || '',
        categorySlug: ''
      }))
    } catch (error) {
      console.error("Error loading top selling:", error)
      return []
    }
  }

  // --- LOGIC TAG (Đã tối ưu) ---
  async fetchProductsByTag(tag: string): Promise<Product[]> {
    // 1. Trả về cache nếu có
    if (this.productsByTag.has(tag)) {
      return this.productsByTag.get(tag)!
    }

    // 2. Chặn duplicate request
    if (this.loadingTags.has(tag)) {
      return [] 
    }

    this.loadingTags.add(tag)
    
    try {
      const data = await productApi.getProductsByTag(tag)
      runInAction(() => {
        this.productsByTag.set(tag, data)
        this.loadingTags.delete(tag)
      })
      return data
    } catch (error) {
      runInAction(() => {
        this.loadingTags.delete(tag)
      })
      return []
    }
  }

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

