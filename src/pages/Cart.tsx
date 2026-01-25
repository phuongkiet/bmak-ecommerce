import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { formatPrice } from '@/utils'
import { Trash2, Minus, Plus } from 'lucide-react'

const Cart = observer(() => {
  const { cartStore } = useStore()
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(null)

  useEffect(() => {
    if (!cartStore.cart && !cartStore.isLoading) {
      cartStore.fetchCart()
    }
  }, [cartStore])

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setUpdatingProductId(productId)
    await cartStore.updateShoppingCartItem(productId, newQuantity)
    setUpdatingProductId(null)
  }

  const handleDeleteItem = async (productId: number) => {
    setUpdatingProductId(productId)
    await cartStore.deleteShoppingCartItem(productId)
    setUpdatingProductId(null)
  }

  const handleClearCart = async () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
      await cartStore.clearShoppingCart()
    }
  }

  const items = cartStore.items

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng</h1>
      
      {cartStore.isLoading ? (
        <div className="text-center py-12 text-gray-600">Đang tải giỏ hàng...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">Giỏ hàng của bạn đang trống</p>
          <a
            href="/products"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Tiếp tục mua sắm
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.productSlug}`} className="flex gap-4 bg-white rounded-lg shadow p-4">
                <img
                  src={item.pictureUrl || '/placeholder-product.png'}
                  alt={item.productName}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-500">Mã: {item.productSlug}</p>
                      <p className="text-sm text-gray-500">Đơn vị bán: {item.saleUnit} ({item.priceUnit})</p>
                    </div>
                    <div className="text-right">
                      <div className="text-primary-600 font-semibold">{formatPrice(item.price)}</div>
                      {item.originalPrice > item.price && (
                        <div className="text-sm text-gray-400 line-through">{formatPrice(item.originalPrice)}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        disabled={updatingProductId === item.productId || cartStore.isLoading || item.quantity <= 1}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Giảm số lượng"
                      >
                        <Minus size={18} className="text-gray-600" />
                      </button>
                      <span className="px-3 py-1 bg-gray-100 rounded min-w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        disabled={updatingProductId === item.productId || cartStore.isLoading}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Tăng số lượng"
                      >
                        <Plus size={18} className="text-gray-600" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.productId)}
                      disabled={updatingProductId === item.productId || cartStore.isLoading}
                      className="p-2 hover:bg-red-50 text-red-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {item.qiuantitySquareMeter ? (
                    <div className="text-sm text-gray-500 mt-2">Quy đổi m²: {item.qiuantitySquareMeter}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn</h2>
            <div className="flex justify-between text-gray-700 mb-2">
              <span>Tổng sản phẩm</span>
              <span>{cartStore.itemCount}</span>
            </div>
            <div className="flex justify-between text-gray-700 mb-2">
              <span>Tổng tiền</span>
              <span className="font-semibold text-primary-600">{formatPrice(cartStore.totalPrice || cartStore.cart?.totalPrice || 0)}</span>
            </div>
            {cartStore.totalSquareMeter > 0 && (
              <div className="flex justify-between text-gray-700 mb-4">
                <span>Tổng m²</span>
                <span>{cartStore.totalSquareMeter}</span>
              </div>
            )}
            <button className="w-full mb-3 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed" disabled={cartStore.isLoading}>
              Tiến hành thanh toán
            </button>
            <button
              onClick={handleClearCart}
              disabled={cartStore.isLoading}
              className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Xóa giỏ hàng
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

export default Cart





