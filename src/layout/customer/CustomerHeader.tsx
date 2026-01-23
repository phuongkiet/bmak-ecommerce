import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Search, ChevronDown } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'

const CustomerHeader = observer(() => {
  const { cartStore, authStore, categoryStore } = useStore()
  const location = useLocation()
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false)

  useEffect(() => {
    // Fetch categories when component mounts
    if (categoryStore.categories.length === 0 && !categoryStore.isLoading) {
      categoryStore.fetchCategories().catch(() => {
        // Error is handled in store, no need to log here
      })
    }
  }, [categoryStore])

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
              GAVICO
            </Link>
          </div>
          
          {/* Navigation Menu Section */}
          <nav className="hidden md:flex ml-10 items-center space-x-1 flex-1 justify-center">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive('/') && location.pathname === '/'
                  ? 'text-primary-600 font-semibold bg-primary-50'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              Trang chủ
            </Link>

            <Link 
              to="/about" 
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive('/about') && location.pathname === '/about'
                  ? 'text-primary-600 font-semibold bg-primary-50'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              Giới thiệu
            </Link>
            
            {/* Products Menu with Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsProductsMenuOpen(true)}
              onMouseLeave={() => setIsProductsMenuOpen(false)}
            >
              <Link
                to="/products"
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-1 ${
                  isActive('/products')
                    ? 'text-primary-600 font-semibold bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                Sản phẩm
                <ChevronDown 
                  size={16} 
                  className={`transition-transform duration-200 ${
                    isProductsMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </Link>
              
              {/* Dropdown Menu */}
              {isProductsMenuOpen && (
                <>
                  {/* Bridge element to prevent gap between button and dropdown */}
                  <div className="absolute top-full left-0 w-full h-2"></div>
                  <div 
                    className="absolute top-full mt-2 w-[800px] bg-white rounded-lg shadow-xl border border-gray-200 py-4 animate-dropdown-fade-in"
                    style={{ 
                      left: '50%',
                      marginLeft: '-400px' // -width/2 để căn giữa, không dùng transform
                    }}
                  >
                    <div className="px-6 py-3 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Danh mục sản phẩm</h3>
                    </div>
                    <div className="px-6 py-4">
                      {categoryStore.isLoading ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Đang tải danh mục...</p>
                        </div>
                      ) : categoryStore.error ? (
                        <div className="text-center py-8">
                          <p className="text-red-500 text-sm">{categoryStore.error}</p>
                        </div>
                      ) : categoryStore.categories.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Chưa có danh mục nào</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-4">
                          {categoryStore.categories.map((category) => (
                            <Link
                              key={category.id}
                              to={`/products?category=${category.id}`}
                              className="block p-4 rounded-lg hover:bg-primary-50 transition-all duration-150 group border border-transparent hover:border-primary-200"
                              onClick={() => setIsProductsMenuOpen(false)}
                            >
                              <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                                {category.name}
                              </div>
                              {category.description && (
                                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {category.description}
                                </div>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <Link 
              to="/news" 
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive('/news')
                  ? 'text-primary-600 font-semibold bg-primary-50'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              Tin tức
            </Link>
            
            <Link 
              to="/showcase" 
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive('/showcase')
                  ? 'text-primary-600 font-semibold bg-primary-50'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              Phối cảnh
            </Link>
          </nav>

          {/* Right Section: Search, Cart, Account */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Search Icon */}
            <button
              className="p-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              aria-label="Tìm kiếm"
            >
              <Search size={22} />
            </button>
            
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              <ShoppingCart size={22} />
              {cartStore.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {cartStore.itemCount}
                </span>
              )}
            </Link>
            
            {/* My Account */}
            {authStore.isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <User size={20} />
                <span className="hidden lg:inline text-sm font-medium">
                  {authStore.userDisplayName}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              to="/cart"
              className="relative p-2 text-gray-700"
            >
              <ShoppingCart size={24} />
              {cartStore.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartStore.itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
})

export default CustomerHeader
