import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { useStore } from '@/store'
import type { CreateVoucherCommand, UpdateVoucherCommand } from '@/models/Voucher'

const PERCENT_DISCOUNT_TYPE = 2
const FIXED_AMOUNT_DISCOUNT_TYPE = 1

const normalizeDiscountTypeToSelectValue = (value?: string | number) => {
  if (value === undefined || value === null) return String(PERCENT_DISCOUNT_TYPE)

  if (typeof value === 'number') {
    return value === FIXED_AMOUNT_DISCOUNT_TYPE
      ? String(FIXED_AMOUNT_DISCOUNT_TYPE)
      : String(PERCENT_DISCOUNT_TYPE)
  }

  const normalized = value.toLowerCase()
  if (normalized.includes('fixed') || normalized.includes('amount')) {
    return String(FIXED_AMOUNT_DISCOUNT_TYPE)
  }

  return String(PERCENT_DISCOUNT_TYPE)
}

const toLocalDateTimeInputValue = (date?: string) => {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

const toIsoStringOrUndefined = (value: string) => {
  if (!value.trim()) return undefined
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return undefined
  return parsed.toISOString()
}

const toNumberOrUndefined = (value: string) => {
  if (!value.trim()) return undefined
  const num = Number(value)
  return Number.isFinite(num) ? num : undefined
}

const AdminVoucherForm = observer(() => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { voucherStore, commonStore } = useStore()

  const voucherId = Number(id)
  const isEditMode = Number.isFinite(voucherId) && voucherId > 0

  const [isInitialLoading, setIsInitialLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState(String(PERCENT_DISCOUNT_TYPE))
  const [discountValue, setDiscountValue] = useState('')
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('')
  const [minOrderAmount, setMinOrderAmount] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    const loadVoucher = async () => {
      if (!isEditMode) return

      setIsInitialLoading(true)
      try {
        await voucherStore.fetchVoucherById(voucherId)
        const data = voucherStore.selectedVoucher

        if (!data) {
          commonStore.showError('Không tìm thấy voucher')
          navigate('/admin/vouchers')
          return
        }

        setCode(data.code || '')
        setName(data.name || '')
        setDescription(data.description || '')
        setDiscountType(normalizeDiscountTypeToSelectValue(data.discountType))
        setDiscountValue(
          data.discountValue === undefined || data.discountValue === null
            ? ''
            : String(data.discountValue),
        )
        setMaxDiscountAmount(
          data.maxDiscountAmount === undefined || data.maxDiscountAmount === null
            ? ''
            : String(data.maxDiscountAmount),
        )
        setMinOrderAmount(
          data.minOrderAmount === undefined || data.minOrderAmount === null
            ? ''
            : String(data.minOrderAmount),
        )
        setUsageLimit(
          data.usageLimit === undefined || data.usageLimit === null
            ? ''
            : String(data.usageLimit),
        )
        setStartDate(toLocalDateTimeInputValue(data.startDate))
        setEndDate(toLocalDateTimeInputValue(data.endDate))
        setIsActive(Boolean(data.isActive))
      } finally {
        setIsInitialLoading(false)
      }
    }

    void loadVoucher()
  }, [isEditMode, voucherId, voucherStore, commonStore, navigate])

  const payload = useMemo<CreateVoucherCommand>(() => {
    return {
      code: code.trim(),
      name: name.trim() || undefined,
      description: description.trim() || undefined,
      discountType: Number(discountType),
      discountValue: Number(discountValue || 0),
      maxDiscountAmount: toNumberOrUndefined(maxDiscountAmount),
      minOrderAmount: toNumberOrUndefined(minOrderAmount),
      usageLimit: toNumberOrUndefined(usageLimit),
      startDate: toIsoStringOrUndefined(startDate),
      endDate: toIsoStringOrUndefined(endDate),
      isActive,
    }
  }, [
    code,
    name,
    description,
    discountType,
    discountValue,
    maxDiscountAmount,
    minOrderAmount,
    usageLimit,
    startDate,
    endDate,
    isActive,
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!payload.code) {
      commonStore.showWarning('Vui lòng nhập mã voucher')
      return
    }

    if (!Number.isFinite(payload.discountValue) || payload.discountValue <= 0) {
      commonStore.showWarning('Giá trị giảm giá phải lớn hơn 0')
      return
    }

    if (payload.startDate && payload.endDate) {
      const from = new Date(payload.startDate)
      const to = new Date(payload.endDate)
      if (to.getTime() <= from.getTime()) {
        commonStore.showWarning('Ngày kết thúc phải lớn hơn ngày bắt đầu')
        return
      }
    }

    setIsSubmitting(true)
    try {
      if (isEditMode) {
        const updatePayload: UpdateVoucherCommand = {
          id: voucherId,
          ...payload,
        }
        await voucherStore.updateVoucher(voucherId, updatePayload)
        commonStore.showSuccess('Cập nhật voucher thành công')
      } else {
        await voucherStore.createVoucher(payload)
        commonStore.showSuccess('Tạo voucher thành công')
      }

      navigate('/admin/vouchers')
    } catch (error) {
      commonStore.showError(voucherStore.error || 'Lưu voucher thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!isEditMode) return

    const confirmed = window.confirm('Bạn có chắc muốn xóa voucher này?')
    if (!confirmed) return

    setIsSubmitting(true)
    try {
      await voucherStore.deleteVoucher(voucherId)
      commonStore.showSuccess('Xóa voucher thành công')
      navigate('/admin/vouchers')
    } catch {
      commonStore.showError(voucherStore.error || 'Xóa voucher thất bại')
      setIsSubmitting(false)
    }
  }

  if (isInitialLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">Đang tải dữ liệu voucher...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/vouchers')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Chỉnh sửa voucher' : 'Thêm voucher mới'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isEditMode && (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={isSubmitting}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Trash2 size={18} />
              Xóa
            </button>
          )}
          <button
            type="submit"
            form="voucher-form"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={18} />
            {isSubmitting ? 'Đang lưu...' : 'Lưu voucher'}
          </button>
        </div>
      </div>

      <form id="voucher-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã voucher <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: GAVICO10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên voucher</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Voucher khai trương"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Thiết lập giảm giá</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kiểu giảm giá <span className="text-red-500">*</span>
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={String(PERCENT_DISCOUNT_TYPE)}>Phần trăm (%)</option>
                <option value={String(FIXED_AMOUNT_DISCOUNT_TYPE)}>Số tiền cố định</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá trị giảm <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa</label>
              <input
                type="number"
                min={0}
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đơn tối thiểu</label>
              <input
                type="number"
                min={0}
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn lượt dùng</label>
              <input
                type="number"
                min={0}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center mt-7">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                Kích hoạt voucher
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Thời gian áp dụng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bắt đầu</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
})

export default AdminVoucherForm
