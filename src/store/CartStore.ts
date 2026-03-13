import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import { CartItem, ShoppingCart } from '@/models/Cart'
import { addToCart, clearCart, getCart, updateCartItem, deleteCartItem } from '@/agent/api/cartApi'

class CartStore {
  rootStore: RootStore
  cartId: string
  cart: ShoppingCart | null = null
  isLoading = false

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    this.cartId = this.loadCartId()
    makeAutoObservable(this)
  }

  get items(): CartItem[] {
    return this.cart?.items || []
  }

  get itemCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0)
  }

  get totalPrice(): number {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  get totalSquareMeter(): number {
    return this.cart?.totalSquareMeter || 0
  }

  private getCartStorageKey(): string {
    const userId = this.rootStore.authStore?.user?.id
    return userId ? `cartId:user:${userId}` : 'cartId:guest'
  }

  private loadCartId(): string {
    const storageKey = this.getCartStorageKey()
    const stored = localStorage.getItem(storageKey)
    if (stored) return stored

    const userId = this.rootStore.authStore?.user?.id
    const generated = userId ? `user-${userId}-${Date.now()}` : `guest-${Date.now()}`
    localStorage.setItem(storageKey, generated)
    return generated
  }

  async syncCartByAuthState(): Promise<void> {
    const nextCartId = this.loadCartId()
    if (nextCartId !== this.cartId) {
      this.cartId = nextCartId
      this.cart = null
    }

    await this.fetchCart()
  }

  private setCart(cart: ShoppingCart): void {
    this.cart = cart
  }

  private logCartError(action: string, error: any, context?: Record<string, unknown>): void {
    const status = error?.status
    const message = error?.message || 'Unknown cart error'
    const details = error?.errors

    console.group(`[CartStore] ${action} failed`)
    console.error('status:', status)
    console.error('message:', message)
    if (details) {
      console.error('validation/errors:', details)
    }
    if (context) {
      console.error('context:', context)
    }
    console.error('raw error:', error)
    console.groupEnd()
  }

  async fetchCart(): Promise<void> {
    this.isLoading = true
    try {
      const data = await getCart(this.cartId)
      runInAction(() => {
        this.setCart(data)
      })
    } catch (error: any) {
      this.logCartError('fetchCart', error, { cartId: this.cartId })
      const message = error?.message || 'Không thể tải giỏ hàng'
      this.rootStore.commonStore.showError(message)
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  async addItem(productId: number, quantity: number = 1): Promise<void> {
    this.isLoading = true
    try {
      const data = await addToCart({
        id: this.cartId,
        productId,
        quantity,
      })
      runInAction(() => {
        this.setCart(data)
      })
      this.rootStore.commonStore.showSuccess('Đã thêm vào giỏ hàng')
    } catch (error: any) {
      this.logCartError('addItem', error, { cartId: this.cartId, productId, quantity })
      const message = error?.message || 'Thêm vào giỏ hàng thất bại'
      this.rootStore.commonStore.showError(message)
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  async clearShoppingCart(): Promise<void> {
    this.isLoading = true
    try {
      const data = await clearCart(this.cartId)
      runInAction(() => {
        this.setCart(data)
      })
      this.rootStore.commonStore.showSuccess('Đã xóa giỏ hàng')
    } catch (error: any) {
      this.logCartError('clearShoppingCart', error, { cartId: this.cartId })
      const message = error?.message || 'Xóa giỏ hàng thất bại'
      this.rootStore.commonStore.showError(message)
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  async updateShoppingCartItem(productId: number, quantity: number): Promise<void> {
    this.isLoading = true
    try {
      const data = await updateCartItem(this.cartId, productId, quantity)
      runInAction(() => {
        this.setCart(data)
      })
      this.rootStore.commonStore.showSuccess('Cập nhật giỏ hàng thành công')
    } catch (error: any) {
      this.logCartError('updateShoppingCartItem', error, { cartId: this.cartId, productId, quantity })
      const message = error?.message || 'Cập nhật giỏ hàng thất bại'
      this.rootStore.commonStore.showError(message)
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  async deleteShoppingCartItem(productId: number): Promise<void> {
    this.isLoading = true
    try {
      const data = await deleteCartItem(this.cartId, productId)
      runInAction(() => {
        this.setCart(data)
      })
      this.rootStore.commonStore.showSuccess('Đã xóa sản phẩm khỏi giỏ hàng')
    } catch (error: any) {
      this.logCartError('deleteShoppingCartItem', error, { cartId: this.cartId, productId })
      const message = error?.message || 'Xóa sản phẩm khỏi giỏ hàng thất bại' 
      this.rootStore.commonStore.showError(message)
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }
}

export default CartStore





