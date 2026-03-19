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
import TagStore from './TagStore'
import AttributeStore from './AttributeStore'
import AttributeValueStore from './AttributeValueStore'
import FavoriteStore from './FavoriteStore'
import NewsStore from './NewsStore'
import VoucherStore from './VoucherStore'
import BusinessRuleStore from './BusinessRuleStore'
import AddressStore from './AddressStore'
import AdminSettingStore from './AdminSettingStore'
import RoomSceneStore from './RoomSceneStore'

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
  tagStore: TagStore
  attributeStore: AttributeStore
  attributeValueStore: AttributeValueStore
  favoriteStore: FavoriteStore
  newsStore: NewsStore
  voucherStore: VoucherStore
  businessRuleStore: BusinessRuleStore
  addressStore: AddressStore
  adminSettingStore: AdminSettingStore
  roomSceneStore: RoomSceneStore

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
    this.tagStore = new TagStore(this)
    this.attributeStore = new AttributeStore(this)
    this.attributeValueStore = new AttributeValueStore(this)
    this.favoriteStore = new FavoriteStore(this)
    this.newsStore = new NewsStore(this)
    this.voucherStore = new VoucherStore(this)
    this.businessRuleStore = new BusinessRuleStore(this)
    this.addressStore = new AddressStore(this)
    this.adminSettingStore = new AdminSettingStore(this)
      this.roomSceneStore = new RoomSceneStore(this)
    
    makeAutoObservable(this)
  }
}

export default RootStore

