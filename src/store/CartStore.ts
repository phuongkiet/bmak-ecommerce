import { makeAutoObservable } from 'mobx'
import RootStore from './RootStore'
import { CartItem } from '@/models/CartItem'

class CartStore {
  items: CartItem[] = []
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  get itemCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0)
  }

  get totalPrice(): number {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  addItem(productId: number, quantity: number = 1, price: number): void {
    const existingItem = this.items.find(item => item.productId === productId)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      this.items.push({
        id: Date.now(),
        productId,
        quantity,
        price,
      })
    }
  }

  removeItem(itemId: number): void {
    this.items = this.items.filter(item => item.id !== itemId)
  }

  updateQuantity(itemId: number, quantity: number): void {
    const item = this.items.find(item => item.id === itemId)
    if (item) {
      if (quantity <= 0) {
        this.removeItem(itemId)
      } else {
        item.quantity = quantity
      }
    }
  }

  clearCart(): void {
    this.items = []
  }
}

export default CartStore





