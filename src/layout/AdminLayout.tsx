import { ReactNode, useState } from 'react'
import AdminSidebar from './admin/AdminSidebar'
import { Search, Bell, User, LogOut } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'

interface AdminLayoutProps {
  children: ReactNode
}

const AdminLayout = observer(({ children }: AdminLayoutProps) => {
  const { authStore } = useStore()
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = async () => {
    await authStore.logout()
    window.location.href = '/'
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Search:', searchQuery)
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
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Thông báo"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
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

