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

  private loadCartId(): string {
    const stored = localStorage.getItem('cartId')
    if (stored) return stored
    const generated = `guest-${Date.now()}`
    localStorage.setItem('cartId', generated)
    return generated
  }

  private setCart(cart: ShoppingCart): void {
    this.cart = cart
  }

  async fetchCart(): Promise<void> {
    this.isLoading = true
    try {
      const data = await getCart(this.cartId)
      runInAction(() => {
        this.setCart(data)
      })
    } catch (error: any) {
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





