import { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import {
  BarChart3,
  CalendarRange,
  Package,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'
import { getProductReport, getRevenueReport } from '@/agent/api/reportApi'
import type { ProductReportDto, RevenueReportDto } from '@/models/Report'
import { formatPrice } from '@/utils'

type RevenueTrendItem = {
  label: string
  revenue: number
  orders: number
}

type TopProductItem = {
  id: number
  name: string
  sku: string
  totalQuantity: number
  revenue: number
  orders: number
}

const toDateInputValue = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDefaultFromDate = (): string => {
  const date = new Date()
  date.setMonth(date.getMonth() - 5)
  date.setDate(1)
  return toDateInputValue(date)
}

const normalizeRevenueTrend = (report: RevenueReportDto | null): RevenueTrendItem[] => {
  if (!report) return []

  return [...report.revenueByDate]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item) => ({
      label: new Date(item.date).toLocaleDateString('vi-VN'),
      revenue: item.revenue,
      orders: item.orders,
    }))
}

const normalizeTopProducts = (report: ProductReportDto | null): TopProductItem[] => {
  if (!report) return []

  return report.topProducts.map((item) => ({
    id: item.productId,
    name: item.productName,
    sku: item.productSku,
    totalQuantity: item.totalQuantity,
    revenue: item.revenue,
    orders: item.orders,
  }))
}

const Dashboard = observer(() => {
  const { productStore } = useStore()
  const [revenueReport, setRevenueReport] = useState<RevenueReportDto | null>(null)
  const [productReport, setProductReport] = useState<ProductReportDto | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    fromDate: getDefaultFromDate(),
    toDate: toDateInputValue(new Date()),
    top: 10,
  })

  const fetchDashboardData = async (bootstrap = false) => {
    if (bootstrap) {
      setIsBootstrapping(true)
    } else {
      setIsRefreshing(true)
    }

    setError(null)

    try {
      const params = {
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        top: filters.top,
      }

      const [revenueData, productData] = await Promise.all([
        getRevenueReport(params),
        getProductReport(params),
      ])

      setRevenueReport(revenueData)
      setProductReport(productData)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Không thể tải dashboard báo cáo')
    } finally {
      setIsBootstrapping(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    void productStore.fetchProducts()
    void fetchDashboardData(true)
  }, [])

  const monthlyRevenue = useMemo(() => normalizeRevenueTrend(revenueReport), [revenueReport])
  const topSellingProducts = useMemo(() => normalizeTopProducts(productReport), [productReport])

  const revenueStats = useMemo(() => ({
    totalRevenue: revenueReport?.totalRevenue ?? 0,
    averageOrderValue: revenueReport?.averageOrderValue ?? 0,
    totalOrders: revenueReport?.totalOrders ?? 0,
  }), [revenueReport])

  const productStats = useMemo(() => ({
    totalProductsSold: productReport?.totalProductsSold ?? 0,
    totalRevenue: productReport?.totalRevenue ?? 0,
    topProductsCount: productReport?.topProducts.length ?? 0,
  }), [productReport])

  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1)
  const maxSold = Math.max(...topSellingProducts.map((p) => p.totalQuantity), 1)

  const stats = [
    {
      title: 'Tổng sản phẩm',
      value: productStore.products.length,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Tổng đơn hàng',
      value: revenueStats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      title: 'Doanh thu',
      value: formatPrice(revenueStats.totalRevenue),
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
    {
      title: 'Sản phẩm đã bán',
      value: productStats.totalProductsSold,
      icon: ShoppingBag,
      color: 'bg-indigo-500',
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-3xl font-bold">Dashboard quản lý</h1>
        <button
          type="button"
          onClick={() => void fetchDashboardData(false)}
          disabled={isRefreshing}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={18} />
          Làm mới dữ liệu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-700">
          <CalendarRange size={16} />
          Bộ lọc báo cáo tổng hợp
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Top sản phẩm</label>
            <input
              type="number"
              min={1}
              max={50}
              value={filters.top}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, top: Math.min(Math.max(Number(e.target.value) || 1, 1), 50) }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => void fetchDashboardData(false)}
              disabled={isRefreshing}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </div>
      </div>

      {(isBootstrapping || isRefreshing) && (
        <div className="bg-white rounded-lg shadow p-6 text-gray-600 mb-6">Đang tải dữ liệu dashboard...</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Báo cáo doanh thu</h2>
            <TrendingUp className="text-green-600" size={20} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg border border-gray-100 p-4 bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Tổng doanh thu</p>
              <p className="text-lg font-bold text-gray-900">{formatPrice(revenueStats.totalRevenue)}</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-4 bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Tổng đơn hàng</p>
              <p className="text-lg font-bold text-gray-900">{revenueStats.totalOrders}</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-4 bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Giá trị TB / đơn</p>
              <p className="text-lg font-bold text-gray-900">{formatPrice(revenueStats.averageOrderValue)}</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-4 bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Số mốc dữ liệu</p>
              <p className="text-lg font-bold text-gray-900">{monthlyRevenue.length}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Doanh thu theo ngày</h3>
            {monthlyRevenue.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có dữ liệu doanh thu trong khoảng thời gian đã chọn.</p>
            ) : (
              <div className="space-y-2">
                {monthlyRevenue.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>{item.label}</span>
                      <span>{formatPrice(item.revenue)} • {item.orders} đơn</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${Math.max((item.revenue / maxMonthlyRevenue) * 100, 6)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Báo cáo sản phẩm</h2>
            <Package className="text-blue-600" size={20} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg border border-gray-100 p-4 bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Tổng số lượng đã bán</p>
              <p className="text-lg font-bold text-gray-900">{productStats.totalProductsSold}</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-4 bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Doanh thu sản phẩm</p>
              <p className="text-lg font-bold text-gray-900">{formatPrice(productStats.totalRevenue)}</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-4 bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Số sản phẩm top</p>
              <p className="text-lg font-bold text-blue-600">{productStats.topProductsCount}</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-4 bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Sản phẩm hệ thống</p>
              <p className="text-lg font-bold text-gray-900">{productStore.products.length}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag size={16} className="text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-700">Top sản phẩm bán chạy</h3>
            </div>

            {topSellingProducts.length === 0 ? (
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <BarChart3 size={16} />
                Chưa có dữ liệu bán chạy.
              </div>
            ) : (
              <div className="space-y-3">
                {topSellingProducts.map((product) => (
                  <div key={product.id}>
                    <div className="flex items-center justify-between text-sm mb-1 gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 truncate">SKU: {product.sku}</p>
                      </div>
                      <span className="text-gray-600">SL: {product.totalQuantity}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.max((product.totalQuantity / maxSold) * 100, 6)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Doanh thu: {formatPrice(product.revenue)} • {product.orders} đơn
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && !isBootstrapping && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 text-red-700 p-4 text-sm">
          <div>Lỗi dashboard: {error}</div>
        </div>
      )}
    </div>
  )
})

export default Dashboard





