import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import * as favoriteApi from '@/agent/api/favoriteApi'
import * as productApi from '@/agent/api/productApi'
import type { FavoriteProductDto } from '@/models/Favorite'

const FAVORITE_STORAGE_KEY = 'favorite_product_ids'

class FavoriteStore {
  rootStore: RootStore
  favoriteIds: number[] = []
  favoriteProducts: FavoriteProductDto[] = []
  isLoading: boolean = false
  error: string | null = null

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
    this.loadIdsFromStorage()
  }

  isFavorite(productId: number): boolean {
    return this.favoriteIds.includes(productId)
  }

  private loadIdsFromStorage(): void {
    try {
      const raw = localStorage.getItem(FAVORITE_STORAGE_KEY)
      if (!raw) {
        this.favoriteIds = []
        return
      }

      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        this.favoriteIds = []
        return
      }

      this.favoriteIds = parsed
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0)
    } catch {
      this.favoriteIds = []
    }
  }

  private saveIdsToStorage(): void {
    localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(this.favoriteIds))
  }

  private setFavoriteIds(ids: number[]): void {
    this.favoriteIds = Array.from(new Set(ids.filter((id) => id > 0)))
    this.saveIdsToStorage()
  }

  async loadFavorites(): Promise<void> {
    this.isLoading = true
    this.error = null

    try {
      if (this.rootStore.authStore.isAuthenticated) {
        const favorites = await favoriteApi.getFavorites()
        runInAction(() => {
          this.favoriteProducts = favorites
          this.setFavoriteIds(favorites.map((item) => item.productId))
          this.isLoading = false
        })
        return
      }

      const ids = [...this.favoriteIds]
      if (ids.length === 0) {
        runInAction(() => {
          this.favoriteProducts = []
          this.isLoading = false
        })
        return
      }

      const results = await Promise.allSettled(ids.map((id) => productApi.getProductById(id)))
      const loaded = results
        .map((result) => (result.status === 'fulfilled' ? result.value : null))
        .filter((item): item is Awaited<ReturnType<typeof productApi.getProductById>> => Boolean(item))

      const mapped: FavoriteProductDto[] = ids
        .map((id) => loaded.find((item) => item.id === id))
        .filter((item): item is Awaited<ReturnType<typeof productApi.getProductById>> => Boolean(item))
        .map((item) => ({
          productId: item.id,
          name: item.name,
          slug: item.slug,
          sku: item.sku,
          price: item.price,
          originalPrice: item.originalPrice || item.price,
          thumbnail: item.thumbnail || item.images?.[0]?.url || '/placeholder-product.png',
          addedAt: new Date(),
        }))

      runInAction(() => {
        this.favoriteProducts = mapped
        this.isLoading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to load favorites'
        this.isLoading = false
      })
    }
  }

  async toggleFavorite(productId: number): Promise<boolean> {
    if (!productId) return false

    const currentlyFavorite = this.isFavorite(productId)

    if (this.rootStore.authStore.isAuthenticated) {
      try {
        if (currentlyFavorite) {
          await favoriteApi.removeFavorite(productId)
          runInAction(() => {
            this.setFavoriteIds(this.favoriteIds.filter((id) => id !== productId))
            this.favoriteProducts = this.favoriteProducts.filter((item) => item.productId !== productId)
          })
          return false
        }

        await favoriteApi.addFavorite({ productId })
        runInAction(() => {
          this.setFavoriteIds([productId, ...this.favoriteIds])
        })
        return true
      } catch (error) {
        runInAction(() => {
          this.error = error instanceof Error ? error.message : 'Failed to update favorite'
        })
      }
    }

    if (currentlyFavorite) {
      runInAction(() => {
        this.setFavoriteIds(this.favoriteIds.filter((id) => id !== productId))
        this.favoriteProducts = this.favoriteProducts.filter((item) => item.productId !== productId)
      })
      return false
    }

    runInAction(() => {
      this.setFavoriteIds([productId, ...this.favoriteIds])
    })
    return true
  }

  async removeFavorite(productId: number): Promise<void> {
    if (!productId) return

    if (this.rootStore.authStore.isAuthenticated) {
      try {
        await favoriteApi.removeFavorite(productId)
      } catch (error) {
        runInAction(() => {
          this.error = error instanceof Error ? error.message : 'Failed to remove favorite'
        })
        return
      }
    }

    runInAction(() => {
      this.setFavoriteIds(this.favoriteIds.filter((id) => id !== productId))
      this.favoriteProducts = this.favoriteProducts.filter((item) => item.productId !== productId)
    })
  }
}

export default FavoriteStore
