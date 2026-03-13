import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import { ArrowLeft, Save, Key } from 'lucide-react'

const AVAILABLE_ROLES = ['Admin', 'Customer']

const AdminUserDetail = observer(() => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { userStore } = useStore()
  const isNew = id === 'new'

  // Edit form state
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Customer'])
  const [isActive, setIsActive] = useState(true)
  const [password, setPassword] = useState('')

  // Change password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [pwError, setPwError] = useState('')

  const [saving, setSaving] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!isNew && id) {
      void userStore.fetchUserDetail(Number(id))
    }
    return () => { userStore.userDetail = null }
  }, [id, isNew])

  useEffect(() => {
    if (userStore.userDetail && !isNew) {
      const u = userStore.userDetail
      setFullName(u.fullName)
      setPhoneNumber(u.phoneNumber || '')
      setEmail(u.email)
      setSelectedRoles(u.roles ?? ['Customer'])
      setIsActive(!u.isDeleted)
    }
  }, [userStore.userDetail, isNew])

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      if (isNew) {
        await userStore.createNewUser({ fullName, email, password, phoneNumber, roles: selectedRoles })
        setSuccessMsg('Tạo người dùng thành công!')
        navigate('/admin/customers')
      } else {
        await userStore.updateUser({
          userId: Number(id),
          fullName,
          phoneNumber,
          roles: selectedRoles,
          isActive,
        })
        setSuccessMsg('Cập nhật thành công!')
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPwError('')
    if (!newPassword || newPassword.length < 6) {
      setPwError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setPwError('Mật khẩu xác nhận không khớp')
      return
    }
    setChangingPw(true)
    try {
      await userStore.changePassword(Number(id), { newPassword, confirmNewPassword })
      setNewPassword('')
      setConfirmNewPassword('')
      setSuccessMsg('Đổi mật khẩu thành công!')
    } catch (e) {
      setPwError(e instanceof Error ? e.message : 'Đổi mật khẩu thất bại')
    } finally {
      setChangingPw(false)
    }
  }

  if (!isNew && userStore.isLoading && !userStore.userDetail) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">Đang tải...</div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/customers')}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">
          {isNew ? 'Thêm người dùng' : `Chỉnh sửa: ${userStore.userDetail?.fullName ?? ''}`}
        </h1>
      </div>

      {successMsg && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {errorMsg}
        </div>
      )}

      {/* Info / Edit form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Thông tin người dùng</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isNew}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0912345678"
            />
          </div>

          {isNew && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
            <div className="flex items-center gap-4">
              {AVAILABLE_ROLES.map((role) => (
                <label key={role} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm text-gray-700">{role}</span>
                </label>
              ))}
            </div>
          </div>

          {!isNew && (
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm font-medium text-gray-700">Tài khoản đang hoạt động</span>
              </label>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
          >
            <Save size={16} />
            {saving ? 'Đang lưu...' : isNew ? 'Tạo người dùng' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {/* Change password – only for edit mode */}
      {!isNew && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Key size={18} />
            Đổi mật khẩu
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPwError('') }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu *</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => { setConfirmNewPassword(e.target.value); setPwError('') }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            {pwError && <p className="text-sm text-red-600">{pwError}</p>}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => void handleChangePassword()}
              disabled={changingPw}
              className="flex items-center gap-2 px-5 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50 text-sm font-medium"
            >
              <Key size={16} />
              {changingPw ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

export default AdminUserDetail
