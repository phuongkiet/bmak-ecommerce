import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import {
  EMPTY_ADMIN_SETTING_COMMAND,
  type UpsertAdminSettingCommand,
} from '@/models/AdminSetting'

const AdminSettings = observer(() => {
  const { adminSettingStore } = useStore()
  const [formData, setFormData] = useState<UpsertAdminSettingCommand>(EMPTY_ADMIN_SETTING_COMMAND)

  useEffect(() => {
    void adminSettingStore.fetchSetting()
  }, [adminSettingStore])

  useEffect(() => {
    if (!adminSettingStore.setting) return

    setFormData({
      companyName: adminSettingStore.setting.companyName || '',
      siteName: adminSettingStore.setting.siteName || '',
      hotline: adminSettingStore.setting.hotline || '',
      logoUrl: adminSettingStore.setting.logoUrl || '',
      taxCode: adminSettingStore.setting.taxCode || '',
      businessAddress: adminSettingStore.setting.businessAddress || '',
    })
  }, [adminSettingStore.setting])

  const handleInputChange = (field: keyof UpsertAdminSettingCommand, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await adminSettingStore.upsertSetting({
      companyName: formData.companyName.trim(),
      siteName: formData.siteName.trim(),
      hotline: formData.hotline.trim(),
      logoUrl: formData.logoUrl.trim(),
      taxCode: formData.taxCode.trim(),
      businessAddress: formData.businessAddress.trim(),
    })

    if (result) {
      alert('Da luu cai dat he thong thanh cong')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Cài đặt</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Cài đặt hệ thống</h2>

        {adminSettingStore.isLoading ? (
          <p className="text-sm text-gray-600">Đang tải cài đặt...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên công ty</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={e => handleInputChange('companyName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Công ty TNHH ABC"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên website</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={e => handleInputChange('siteName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="BMak Ecommerce"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hotline</label>
              <input
                type="text"
                value={formData.hotline}
                onChange={e => handleInputChange('hotline', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="1900xxxx"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={e => handleInputChange('logoUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
              <input
                type="text"
                value={formData.taxCode}
                onChange={e => handleInputChange('taxCode', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0101234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ kinh doanh</label>
              <textarea
                value={formData.businessAddress}
                onChange={e => handleInputChange('businessAddress', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                required
              />
            </div>

            {adminSettingStore.error && (
              <p className="text-sm text-red-600">{adminSettingStore.error}</p>
            )}

            <button
              type="submit"
              disabled={adminSettingStore.isSubmitting}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {adminSettingStore.isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
})

export default AdminSettings





