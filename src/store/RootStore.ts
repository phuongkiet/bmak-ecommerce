import { makeAutoObservable } from 'mobx'
import CommonStore from './CommonStore'
import CartStore from './CartStore'
import ProductStore from './ProductStore'
import AuthStore from './AuthStore'
import CategoryStore from './CategoryStore'
import PageStore from './PageStore'
import OrderStore from './OrderStore'
import WardStore from './WardStore'
import ProvinceStore from './ProvinceStore'
import UserStore from './UserStore'
import MediaStore from './MediaStore'

class RootStore {
  commonStore: CommonStore
  cartStore: CartStore
  productStore: ProductStore
  authStore: AuthStore
  categoryStore: CategoryStore
  pageStore: PageStore
  orderStore: OrderStore
  wardStore: WardStore
  provinceStore: ProvinceStore
  userStore: UserStore
  mediaStore: MediaStore

  constructor() {
    this.commonStore = new CommonStore(this)
    this.cartStore = new CartStore(this)
    this.productStore = new ProductStore(this)
    this.authStore = new AuthStore(this)
    this.categoryStore = new CategoryStore(this)
    this.pageStore = new PageStore(this)
    this.orderStore = new OrderStore(this)
    this.wardStore = new WardStore(this)
    this.provinceStore = new ProvinceStore(this)
    this.userStore = new UserStore(this)
    this.mediaStore = new MediaStore(this)
    
    makeAutoObservable(this)
  }
}

export default RootStore

