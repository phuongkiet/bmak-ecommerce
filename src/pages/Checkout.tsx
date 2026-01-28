import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import { CreateOrderData, OrderAddressDto } from '@/models/Order'
import { formatPrice } from '@/utils'

const Checkout = observer(() => {
  const { cartStore, orderStore } = useStore()

  // Form state
  const [formData, setFormData] = useState<CreateOrderData>({
    cartId: cartStore.cartId,
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    billingAddress: {
      province: '',
      ward: '',
      specificAddress: '',
    },
    shipToDifferentAddress: false,
    paymentMethod: 'COD',
    note: '',
  })

  const [shippingFee] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountCode, setDiscountCode] = useState('')

  useEffect(() => {
    document.title = 'Thanh toán - GAVICO'
  }, [])

  const subTotal = cartStore.totalPrice
  const total = subTotal + shippingFee - discountAmount

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field: string
  ) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    addressField: string,
    addressType: 'billing' | 'shipping' = 'billing'
  ) => {
    const value = e.target.value
    const addressKey = addressType === 'billing' ? 'billingAddress' : 'shippingAddress'

    setFormData(prev => ({
      ...prev,
      [addressKey]: {
        ...(prev[addressKey] as OrderAddressDto),
        [addressField]: value,
      },
    }))
  }

  const handleShipToDifferentAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      shipToDifferentAddress: e.target.checked,
    }))
  }

  const applyDiscount = () => {
    // TODO: Call API to validate discount code
    if (discountCode === 'GAVICO10') {
      setDiscountAmount(subTotal * 0.1) // 10% discount
    } else {
      alert('Mã giảm giá không hợp lệ')
      setDiscountAmount(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.buyerName || !formData.buyerPhone || !formData.buyerEmail) {
      alert('Vui lòng điền đầy đủ thông tin người mua')
      return
    }

    if (!formData.billingAddress.specificAddress) {
      alert('Vui lòng điền địa chỉ thanh toán')
      return
    }

    if (formData.shipToDifferentAddress) {
      if (!formData.receiverName || !formData.receiverPhone || !formData.shippingAddress?.specificAddress) {
        alert('Vui lòng điền đầy đủ thông tin người nhận')
        return
      }
    }

    const result = await orderStore.createOrder(formData)

    if (result.success) {      
      // Clear cart and navigate
      await cartStore.clearShoppingCart()
      window.location.href = '/complete-checkout'
    } else {
      alert(`✗ ${result.error || 'Đặt hàng thất bại'}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Billing & Shipping Info */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* BILLING INFO */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Thông tin người mua</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Họ và tên *</label>
                  <input
                    type="text"
                    value={formData.buyerName}
                    onChange={e => handleInputChange(e, 'buyerName')}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.buyerEmail}
                    onChange={e => handleInputChange(e, 'buyerEmail')}
                    placeholder="nguyenvana@gmail.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Số điện thoại *</label>
                  <input
                    type="tel"
                    value={formData.buyerPhone}
                    onChange={e => handleInputChange(e, 'buyerPhone')}
                    placeholder="0912345678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* BILLING ADDRESS */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Địa chỉ thanh toán</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tỉnh/Thành phố *</label>
                  <input
                    type="text"
                    value={formData.billingAddress.province}
                    onChange={e => handleAddressChange(e, 'province', 'billing')}
                    placeholder="TP. Hồ Chí Minh"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phường/Xã *</label>
                    <input
                      type="text"
                      value={formData.billingAddress.ward}
                      onChange={e => handleAddressChange(e, 'ward', 'billing')}
                      placeholder="Phường Bến Nghé"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Số nhà, tên đường *</label>
                  <input
                    type="text"
                    value={formData.billingAddress.specificAddress}
                    onChange={e => handleAddressChange(e, 'specificAddress', 'billing')}
                    placeholder="123 Đường Lê Lợi"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SHIP TO DIFFERENT ADDRESS */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.shipToDifferentAddress}
                  onChange={handleShipToDifferentAddress}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-2"
                />
                <span className="ml-3 text-sm font-medium">Giao đến địa chỉ khác</span>
              </label>
            </div>

            {/* SHIPPING ADDRESS */}
            {formData.shipToDifferentAddress && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Thông tin người nhận</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Họ và tên *</label>
                    <input
                      type="text"
                      value={formData.receiverName || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          receiverName: e.target.value,
                        }))
                      }
                      placeholder="Trần Thị B"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Số điện thoại *</label>
                    <input
                      type="tel"
                      value={formData.receiverPhone || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          receiverPhone: e.target.value,
                        }))
                      }
                      placeholder="0987654321"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tỉnh/Thành phố *</label>
                    <input
                      type="text"
                      value={formData.shippingAddress?.province || ''}
                      onChange={e => handleAddressChange(e, 'province', 'shipping')}
                      placeholder="TP. Hồ Chí Minh"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phường/Xã *</label>
                    <input
                      type="text"
                      value={formData.shippingAddress?.ward || ''}
                      onChange={e => handleAddressChange(e, 'ward', 'shipping')}
                      placeholder="Phường Võ Thị Sáu"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Số nhà, tên đường *</label>
                    <input
                      type="text"
                      value={formData.shippingAddress?.specificAddress || ''}
                      onChange={e => handleAddressChange(e, 'specificAddress', 'shipping')}
                      placeholder="456 Đường Cách Mạng Tháng 8"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PAYMENT METHOD & NOTE */}
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phương thức thanh toán</label>
                <div className="space-y-2">
                  {['COD', 'Banking', 'VNPAY'].map(method => (
                    <label key={method} className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={formData.paymentMethod === method}
                        onChange={e => handleInputChange(e, 'paymentMethod')}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="ml-3 text-sm">
                        {method === 'COD' && 'Thanh toán khi nhận hàng (COD)'}
                        {method === 'Banking' && 'Chuyển khoản ngân hàng'}
                        {method === 'VNPAY' && 'Thanh toán qua VNPay'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú đơn hàng</label>
                <textarea
                  value={formData.note}
                  onChange={e => handleInputChange(e, 'note')}
                  placeholder="Giao vào giờ hành chính, cẩn thận với mặt hàng..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>

            {/* Cart Items */}
            <div className="mb-6 max-h-96 overflow-y-auto border-b pb-4">
              {cartStore.items.length > 0 ? (
                <div className="space-y-3">
                  {cartStore.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-gray-500">x{item.quantity}</p>
                      </div>
                      <p className="font-medium text-right">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Giỏ hàng trống</p>
              )}
            </div>

            {/* Subtotal */}
            <div className="space-y-3 mb-4 pb-4 border-b">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">{formatPrice(subTotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium">{formatPrice(shippingFee)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span className="font-medium">-{formatPrice(discountAmount)}</span>
                </div>
              )}
            </div>

            {/* Discount Code */}
            <div className="mb-4 pb-4 border-b">
              <label className="block text-sm font-medium mb-2">Mã giảm giá</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={e => setDiscountCode(e.target.value)}
                  placeholder="Nhập mã giảm giá"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={applyDiscount}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Áp dụng
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Tổng cộng:</span>
                <span className="text-2xl font-bold text-primary-600">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => document.querySelector('form')?.requestSubmit()}
              disabled={orderStore.isLoading || cartStore.items.length === 0}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {orderStore.isLoading ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>

            {/* Info */}
            <p className="text-xs text-gray-500 text-center mt-4">
              ✓ Nhân viên sẽ liên lạc xác nhận trong vòng 3 giờ
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

export default Checkout





