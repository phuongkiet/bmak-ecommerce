import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import { BarChart3, Package, ShoppingCart, Users, TrendingUp } from 'lucide-react'

const Dashboard = observer(() => {
  const { productStore } = useStore()

  useEffect(() => {
    // Load initial data
    productStore.fetchProducts()
  }, [])

  const stats = [
    {
      title: 'Tổng sản phẩm',
      value: productStore.products.length,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Đơn hàng hôm nay',
      value: '0',
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      title: 'Khách hàng',
      value: '0',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Doanh thu',
      value: '0 đ',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Đơn hàng gần đây</h2>
          <div className="text-center py-8 text-gray-500">
            <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
            <p>Chưa có đơn hàng nào</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Sản phẩm bán chạy</h2>
          <div className="text-center py-8 text-gray-500">
            <Package size={48} className="mx-auto mb-2 opacity-50" />
            <p>Chưa có dữ liệu</p>
          </div>
        </div>
      </div>
    </div>
  )
})

export default Dashboard





