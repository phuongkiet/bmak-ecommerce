import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './store'
import CustomerLayout from './layout/CustomerLayout'
import AdminLayout from './layout/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import NotificationContainer from './components/NotificationContainer'

// Customer pages
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import News from './pages/News'
import Showcase from './pages/Showcase'
import AboutUs from './pages/AboutUs'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AddProduct from './pages/admin/CreatePage/Product/AddProduct'
import AdminOrders from './pages/admin/AdminOrders'
import AdminCustomers from './pages/admin/AdminUsers'
import AdminCategories from './pages/admin/AdminCategories'
import AdminReports from './pages/admin/AdminReports'
import AdminSettings from './pages/admin/AdminSettings'
import AdminPages from './pages/admin/AdminPages'
import AdminDetailPage from './pages/admin/DetailPage/AdminDetailPage'
import AdminMedias from './pages/admin/AdminMedias'
import CompleteCheckout from './pages/CompleteCheckout'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import AdminSignIn from './pages/admin/AdminSignIn'
import AddPage from './pages/admin/CreatePage/Page/AddPage'

function App() {
  return (
    <StoreProvider>
      <NotificationContainer />
      <Router>
        <Routes>

          <Route path="/admin/sign-in" element={<AdminSignIn />} />

          {/* Customer Routes */}
          <Route
            path="/*"
            element={
              <CustomerLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/showcase" element={<Showcase />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/complete-checkout" element={<CompleteCheckout />} />
                  <Route path="/sign-in" element={<SignIn />} />
                  <Route path="/sign-up" element={<SignUp />} />
                </Routes>
              </CustomerLayout>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/add" element={<AddProduct />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="media" element={<AdminMedias />} />
                    <Route path="pages" element={<AdminPages />} />
                    <Route path="pages/:slug" element={<AdminDetailPage />} />
                    <Route path="pages/add" element={<AddPage />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </StoreProvider>
  )
}

export default App

