import { ReactNode, useMemo, useState, type FormEvent } from 'react'
import AdminSidebar from './admin/AdminSidebar'
import { Search, Bell, User, LogOut } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import useSignalR from '@/hooks/useSignalR'

interface AdminLayoutProps {
  children: ReactNode
}

interface AdminNotificationItem {
  id: string
  message: string
  createdAt: Date
  isRead: boolean
}

const AdminLayout = observer(({ children }: AdminLayoutProps) => {
  const { authStore } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([])

  const isAdmin = authStore.isAuthenticated && (authStore.user?.roles?.includes('Admin') ?? false)

  const { isConnected, error } = useSignalR({
    enabled: isAdmin,
    onReceiveNewOrder: (orderData) => {
      const fallbackMessage = 'Có đơn hàng mới vừa được tạo'
      const message =
        typeof orderData?.message === 'string' && orderData.message.trim()
          ? orderData.message
          : fallbackMessage

      setNotifications((prev) => {
        const item: AdminNotificationItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          message,
          createdAt: new Date(),
          isRead: false,
        }

        return [item, ...prev].slice(0, 30)
      })
    },
  })

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  )

  const handleLogout = async () => {
    await authStore.logout()
    window.location.href = '/'
  }

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Search:', searchQuery)
  }

  const toggleNotificationPanel = () => {
    const nextOpen = !isNotificationOpen
    setIsNotificationOpen(nextOpen)

    if (!isNotificationOpen) {
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      )
    }
  }

  const formatNotificationTime = (date: Date): string => {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-64 min-h-screen">
          {/* Top Bar with Search Bar and Icons */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-40">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <form onSubmit={handleSearch} className="relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  size={18} 
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </form>
            </div>

            {/* Right Section - Icons */}
            <div className="flex items-center gap-3">
              {/* Notification Icon */}
              <button 
                type="button"
                onClick={toggleNotificationPanel}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Thông báo"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute top-16 right-28 w-96 max-h-[28rem] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Thông báo admin</p>
                      <p className="text-xs text-gray-500">
                        SignalR: {isConnected ? 'Đã kết nối' : 'Đang ngắt kết nối'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Đóng
                    </button>
                  </div>

                  {error && (
                    <div className="px-4 py-2 text-xs text-red-700 bg-red-50 border-b border-red-100">
                      Lỗi kết nối SignalR: {error}
                    </div>
                  )}

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-10 text-center text-sm text-gray-500">
                        Chưa có thông báo mới
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-gray-100 ${notification.isRead ? 'bg-white' : 'bg-blue-50/40'}`}
                        >
                          <p className="text-sm text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {/* My Account Icon */}
              <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                <button
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Tài khoản"
                >
                  <User size={20} />
                </button>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {authStore.userDisplayName}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
})

export default AdminLayout

