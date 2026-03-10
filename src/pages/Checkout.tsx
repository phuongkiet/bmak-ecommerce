import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import { CreateOrderData, OrderAddressDto } from '@/models/Order'
import { formatPrice } from '@/utils'
import ProvinceSelectComponent from '@/components/Address/ProvinceSelectComponent'
import WardSelectComponent from '@/components/Address/WardSelectComponent'
import * as businessRuleApi from '@/agent/api/businessRuleApi'
import { BusinessRuleDto } from '@/models/BusinessRule'
import type { AddressDto } from '@/models/Address'

const SHIPPING_FEE_ACTION_TYPE = 1

const normalizeRuleKey = (rawKey?: string) => (rawKey || '').trim().toLowerCase()

const normalizeText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')

type RuleContext = {
  subTotal: number
  province: string
  ward: string
}

const tryParseNumber = (value: string): number | null => {
  const cleaned = value.replace(/[^0-9.-]/g, '')
  if (!cleaned) return null
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

const resolveConditionValue = (key: string, context: RuleContext): string | number | null => {
  const normalizedKey = normalizeRuleKey(key)
  const isSubTotalKey =
    normalizedKey.includes('subtotal') ||
    normalizedKey.includes('order') ||
    normalizedKey.includes('amount') ||
    normalizedKey.includes('carttotal')

  if (isSubTotalKey) {
    return context.subTotal
  }

  const isProvinceKey =
    normalizedKey === 'province' ||
    normalizedKey === 'city' ||
    normalizedKey === 'tinh' ||
    normalizedKey === 'tinhthanh'

  if (isProvinceKey) {
    return context.province
  }

  const isWardKey =
    normalizedKey === 'ward' ||
    normalizedKey === 'phuong' ||
    normalizedKey === 'xa'

  if (isWardKey) {
    return context.ward
  }

  return null
}

const evaluateRuleCondition = (
  condition: BusinessRuleDto['conditions'][number],
  context: RuleContext,
): boolean => {
  const left = resolveConditionValue(condition.conditionKey, context)
  const rightRaw = condition.conditionValue || ''

  if (left === null) {
    return false
  }

  if (typeof left === 'number') {
    const right = tryParseNumber(rightRaw)
    if (right === null) return false

    switch (Number(condition.operator)) {
      case 1:
        return left > right
      case 2:
        return left >= right
      case 3:
        return left === right
      case 4:
        return normalizeText(String(left)).includes(normalizeText(String(rightRaw)))
      default:
        return false
    }
  }

  const leftText = normalizeText(String(left))
  const rightText = normalizeText(String(rightRaw))

  switch (Number(condition.operator)) {
    case 3:
      return leftText === rightText
    case 4:
      return leftText.includes(rightText)
    default:
      return false
  }
}

const doesRuleMatch = (rule: BusinessRuleDto, context: RuleContext): boolean => {
  if (!rule.isActive) return false
  if (!rule.conditions?.length) return true
  return rule.conditions.every(condition => evaluateRuleCondition(condition, context))
}

const calculateShippingFromRules = (
  rules: BusinessRuleDto[],
  context: RuleContext,
): { fee: number; message: string } => {
  const sortedRules = [...rules]
    .filter(rule => rule.isActive)
    .sort((a, b) => a.priority - b.priority)

  let selectedFee: number | null = null
  let selectedRuleName = ''

  for (const rule of sortedRules) {
    if (!doesRuleMatch(rule, context)) continue

    const shippingFeeAction = rule.actions?.find(
      action => Number(action.actionType) === SHIPPING_FEE_ACTION_TYPE,
    )

    if (shippingFeeAction && selectedFee === null) {
      selectedFee = Math.max(0, Number(shippingFeeAction.actionValue ?? 0))
      selectedRuleName = rule.name || ''
    }

    // Shipping fee uses first matched rule by priority; stopProcessing still respected.
    if (selectedFee !== null) break
    if (rule.stopProcessing) break
  }

  const finalFee = selectedFee ?? 0
  const message = selectedRuleName
    ? `Phí ship đang áp dụng theo rule: ${selectedRuleName}`
    : 'Phí ship mặc định theo cấu hình hiện tại'

  return { fee: finalFee, message }
}

const Checkout = observer(() => {
  const { cartStore, orderStore, provinceStore, wardStore, voucherStore, businessRuleStore, addressStore, authStore } = useStore()

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

  const [shippingFee, setShippingFee] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountCode, setDiscountCode] = useState('')
  const [billingProvinceId, setBillingProvinceId] = useState('')
  const [billingWardId, setBillingWardId] = useState('')
  const [shippingProvinceId, setShippingProvinceId] = useState('')
  const [shippingWardId, setShippingWardId] = useState('')
  const [voucherMessage, setVoucherMessage] = useState('')
  const [voucherMessageType, setVoucherMessageType] = useState<'success' | 'error' | ''>('')
  const [shippingRules, setShippingRules] = useState<BusinessRuleDto[]>([])
  const [shippingMessage, setShippingMessage] = useState('')

  const applySavedAddress = (address: AddressDto, target: 'billing' | 'shipping') => {
    if (target === 'billing') {
      setFormData(prev => ({
        ...prev,
        buyerName: prev.buyerName || address.receiverName,
        buyerPhone: prev.buyerPhone || address.phone,
        billingAddress: {
          ...prev.billingAddress,
          province: address.provinceName,
          ward: address.wardName,
          specificAddress: address.street,
        },
      }))

      setBillingProvinceId(address.provinceId)
      setBillingWardId(address.wardId)
      void wardStore.fetchWardsByProvinceId(address.provinceId)
      return
    }

    setFormData(prev => ({
      ...prev,
      receiverName: prev.receiverName || address.receiverName,
      receiverPhone: prev.receiverPhone || address.phone,
      shippingAddress: {
        ...(prev.shippingAddress || { province: '', ward: '', specificAddress: '' }),
        province: address.provinceName,
        ward: address.wardName,
        specificAddress: address.street,
      },
    }))

    setShippingProvinceId(address.provinceId)
    setShippingWardId(address.wardId)
    void wardStore.fetchWardsByProvinceId(address.provinceId)
  }

  useEffect(() => {
    document.title = 'Thanh toán - GAVICO'
    provinceStore.fetchProvinces()
    if (authStore.isAuthenticated) {
      void addressStore.fetchMyAddresses()
    }

    const loadShippingFeeFromBusinessRule = async () => {
      try {
        await businessRuleStore.fetchBusinessRules({
          pageIndex: 1,
          pageSize: 100,
          isActive: true,
        })

        const rules = businessRuleStore.businessRules?.items || []
        const activeRules = [...rules]
          .filter(rule => rule.isActive)
          .sort((a, b) => a.priority - b.priority)

        // The list endpoint can omit actions/conditions; fetch rule details by id.
        const detailedRules = await Promise.all(
          activeRules.map(async rule => {
            try {
              return await businessRuleApi.getBusinessRuleById(rule.id)
            } catch {
              return null
            }
          }),
        )

        const validDetailedRules = detailedRules.filter(
          (rule): rule is BusinessRuleDto => rule !== null,
        )

        setShippingRules(validDetailedRules)
      } catch {
        setShippingRules([])
        setShippingFee(0)
        setShippingMessage('Chưa tải được business rule phí ship')
      }
    }

    void loadShippingFeeFromBusinessRule()
  }, [addressStore, authStore.isAuthenticated])

  useEffect(() => {
    if (!authStore.user?.email) return

    setFormData(prev => ({
      ...prev,
      buyerEmail: authStore.user?.email || prev.buyerEmail,
    }))
  }, [authStore.user?.email])

  useEffect(() => {
    if (!addressStore.addresses.length) return
    if (formData.billingAddress.specificAddress) return

    const defaultAddress = addressStore.addresses[0]
    if (!defaultAddress) return

    applySavedAddress(defaultAddress, 'billing')
  }, [addressStore.addresses, formData.billingAddress.specificAddress])

  useEffect(() => {
    if (!formData.shipToDifferentAddress) return
    if (!addressStore.addresses.length) return
    if (formData.shippingAddress?.specificAddress) return

    const defaultAddress = addressStore.addresses[0]
    if (!defaultAddress) return

    applySavedAddress(defaultAddress, 'shipping')
  }, [
    formData.shipToDifferentAddress,
    formData.shippingAddress?.specificAddress,
    addressStore.addresses,
  ])

  const subTotal = cartStore.totalPrice
  const total = Math.max(0, subTotal + shippingFee - discountAmount)
  const activeAddress = formData.shipToDifferentAddress ? formData.shippingAddress : formData.billingAddress
  const activeProvince = activeAddress?.province || ''
  const activeWard = activeAddress?.ward || ''

  useEffect(() => {
    const { fee, message } = calculateShippingFromRules(shippingRules, {
      subTotal,
      province: activeProvince,
      ward: activeWard,
    })
    setShippingFee(fee)
    setShippingMessage(message)
  }, [shippingRules, subTotal, activeProvince, activeWard])

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

  const applyDiscount = async () => {
    const code = discountCode.trim()

    if (!code) {
      setDiscountAmount(0)
      setVoucherMessage('Vui lòng nhập mã giảm giá')
      setVoucherMessageType('error')
      return
    }

    if (subTotal <= 0) {
      setDiscountAmount(0)
      setVoucherMessage('Giỏ hàng trống, không thể áp dụng mã')
      setVoucherMessageType('error')
      return
    }

    try {
      const result = await voucherStore.applyVoucher({
        code,
        cartId: cartStore.cartId,
      })

      const calculatedDiscount = Math.max(0, Number(result.discountAmount ?? 0))
      const finalDiscount = Math.min(calculatedDiscount, subTotal + shippingFee)
      const isValid = result.isValid ?? finalDiscount > 0

      if (!isValid) {
        setDiscountAmount(0)
        setVoucherMessage(result.message || 'Mã giảm giá không hợp lệ')
        setVoucherMessageType('error')
        return
      }

      setDiscountAmount(finalDiscount)
      setVoucherMessage(
        result.message ||
          `Áp dụng mã thành công, giảm ${formatPrice(finalDiscount)}`,
      )
      setVoucherMessageType('success')
    } catch (error) {
      setDiscountAmount(0)
      setVoucherMessage(
        error instanceof Error ? error.message : 'Không thể áp dụng mã giảm giá',
      )
      setVoucherMessageType('error')
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
                  <ProvinceSelectComponent
                    data={provinceStore.provinces}
                    value={billingProvinceId}
                    onChange={province => {
                      const provinceName = province?.name || ''
                      const provinceId = province?.id || ''

                      setFormData(prev => ({
                        ...prev,
                        billingAddress: {
                          ...prev.billingAddress,
                          province: provinceName,
                          ward: '', // Reset ward khi đổi province
                        },
                      }))

                      setBillingProvinceId(provinceId)
                      setBillingWardId('')
                      // Clear và load wards mới
                      wardStore.clearWards()
                      if (provinceId) {
                        wardStore.fetchWardsByProvinceId(provinceId)
                      }
                    }}
                    isLoading={provinceStore.isLoading}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phường/Xã *</label>
                    <WardSelectComponent
                      data={wardStore.wards}
                      value={billingWardId}
                      onChange={ward => {
                        const wardName = ward?.name || ''
                        const wardId = ward?.id || ''

                        setFormData(prev => ({
                          ...prev,
                          billingAddress: {
                            ...prev.billingAddress,
                            ward: wardName,
                          },
                        }))

                        setBillingWardId(wardId)
                      }}
                      isDisabled={!billingProvinceId}
                      isLoading={wardStore.isLoading}
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
                    <ProvinceSelectComponent
                      data={provinceStore.provinces}
                        value={shippingProvinceId}
                      onChange={province => {
                          const provinceName = province?.name || ''
                          const provinceId = province?.id || ''

                        setFormData(prev => ({
                          ...prev,
                          shippingAddress: {
                            ...(prev.shippingAddress || { province: '', ward: '', specificAddress: '' }),
                              province: provinceName,
                            ward: '', // Reset ward khi đổi province
                          },
                        }))
                          setShippingProvinceId(provinceId)
                          setShippingWardId('')
                        // Clear và load wards mới cho shipping address
                          if (provinceId) {
                            wardStore.fetchWardsByProvinceId(provinceId)
                        }
                      }}
                      isLoading={provinceStore.isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phường/Xã *</label>
                    <WardSelectComponent
                      data={wardStore.wards}
                      value={shippingWardId}
                      onChange={ward => {
                        const wardName = ward?.name || ''
                        const wardId = ward?.id || ''

                        setFormData(prev => ({
                          ...prev,
                          shippingAddress: {
                            ...(prev.shippingAddress || { province: '', ward: '', specificAddress: '' }),
                            ward: wardName,
                          },
                        }))
                        setShippingWardId(wardId)
                      }}
                      isDisabled={!shippingProvinceId}
                      isLoading={wardStore.isLoading}
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
              {shippingMessage && (
                <p className="text-xs text-gray-500">{shippingMessage}</p>
              )}

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
                  onChange={e => {
                    setDiscountCode(e.target.value)
                    if (voucherMessage) {
                      setVoucherMessage('')
                      setVoucherMessageType('')
                    }
                  }}
                  placeholder="Nhập mã giảm giá"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    void applyDiscount()
                  }}
                  disabled={voucherStore.isLoading}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  {voucherStore.isLoading ? 'Đang áp dụng...' : 'Áp dụng'}
                </button>
              </div>
              {voucherMessage && (
                <p
                  className={`mt-2 text-sm ${
                    voucherMessageType === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {voucherMessage}
                </p>
              )}
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





