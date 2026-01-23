import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Settings,
  FileText,
  ChevronDown,
  FileEdit
} from 'lucide-react'

const AdminSidebar = () => {
  const location = useLocation()
  const [isPagesOpen, setIsPagesOpen] = useState(location.pathname.startsWith('/admin/pages'))

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Bảng điều khiển' },
    { path: '/admin/products', icon: Package, label: 'Sản phẩm', hasDropdown: true },
    { path: '/admin/categories', icon: FileText, label: 'Danh mục sản phẩm', hasDropdown: true },
    { path: '/admin/customers', icon: Users, label: 'Quản lý người dùng', hasDropdown: true },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng' },
    { path: '/admin/reports', icon: BarChart3, label: 'Báo cáo' },
    { path: '/admin/pages', icon: FileEdit, label: 'Trang', hasDropdown: true, hasSubmenu: true },
    { path: '/admin/settings', icon: Settings, label: 'Cài đặt' },
  ]

  const pageSubmenu = [
    { path: '/admin/pages/home', label: 'Trang chủ' },
    { path: '/admin/pages/about', label: 'Giới thiệu' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
      {/* Logo Section */}
      <div className="px-6 py-6 border-b border-gray-100">
        <NavLink to="/admin" className="flex items-center">
          <span className="text-gray-800 font-bold text-xl">BMAK Store</span>
        </NavLink>
      </div>

      {/* Menu Section */}
      <nav className="px-4 py-4">
        <div className="text-gray-400 text-xs font-medium uppercase mb-4 px-4">MENU</div>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isPagesItem = item.path === '/admin/pages'
            
            return (
              <div key={item.path}>
                {isPagesItem ? (
                  <div>
                    <button
                      onClick={() => setIsPagesOpen(!isPagesOpen)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        location.pathname.startsWith('/admin/pages')
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.hasDropdown && (
                        <ChevronDown 
                          size={16} 
                          className={`text-gray-400 transition-transform ${isPagesOpen ? 'rotate-180' : ''}`}
                        />
                      )}
                      <Icon size={20} />
                      <span className="text-sm">{item.label}</span>
                    </button>
                    {isPagesOpen && (
                      <div className="ml-8 mt-1 space-y-1">
                        {pageSubmenu.map((subItem) => (
                          <NavLink
                            key={subItem.path}
                            to={subItem.path}
                            className={({ isActive }) =>
                              `block px-4 py-2 rounded-lg transition-colors text-sm ${
                                isActive
                                  ? 'bg-primary-50 text-primary-600 font-medium'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`
                            }
                          >
                            {subItem.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    end={item.path === '/admin'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    {item.hasDropdown && (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                    <Icon size={20} />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                )}
              </div>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}

export default AdminSidebar

