import { CheckCircle, Clock, Package, Phone } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const CompleteCheckout = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-6 px-4 flex items-center">
      <div className="container mx-auto max-w-3xl w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <CheckCircle size={80} className="text-green-600" strokeWidth={1.5} />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Đặt hàng thành công!</h1>
          <p className="text-gray-600 mb-4 text-center text-md">
            Cảm ơn bạn. Nhân viên sẽ liên lạc xác nhận <strong>trong 3 giờ</strong>
          </p>

          {/* Order Info */}
          {orderId && (
            <div className="bg-gray-50 rounded p-3 mb-4 border border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
              <p className="text-2xl font-bold text-primary-600">#{orderId}</p>
              <p className="text-sm text-gray-500 mt-1">{currentDate}</p>
            </div>
          )}

          {/* Next Steps - Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {/* Step 1 */}
            <div className="bg-blue-50 rounded p-3 border border-blue-200 text-center">
              <div className="flex justify-center mb-2">
                <Phone size={24} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-md mb-1">Xác nhận</h3>
              <p className="text-md text-gray-600">Liên lạc trong 3 giờ</p>
            </div>

            {/* Step 2 */}
            <div className="bg-purple-50 rounded p-3 border border-purple-200 text-center">
              <div className="flex justify-center mb-2">
                <Clock size={24} className="text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-md mb-1">Chuẩn bị</h3>
              <p className="text-md text-gray-600">Giao vận chuyển</p>
            </div>

            {/* Step 3 */}
            <div className="bg-orange-50 rounded p-3 border border-orange-200 text-center">
              <div className="flex justify-center mb-2">
                <Package size={24} className="text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-md mb-1">Giao nhận</h3>
              <p className="text-md text-gray-600">Nhận hàng tại công trình</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-3 py-2 bg-gray-200 text-gray-800 rounded font-semibold hover:bg-gray-300 transition-colors text-sm"
            >
              Trang chủ
            </button>
            <button
              onClick={() => navigate('/products')}
              className="px-3 py-2 bg-primary-600 text-white rounded font-semibold hover:bg-primary-700 transition-colors text-sm"
            >
              Mua thêm
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="px-3 py-2 border-2 border-primary-600 text-primary-600 rounded font-semibold hover:bg-primary-50 transition-colors text-sm"
            >
              Xem đơn
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-gray-600 text-xs">
          Liên hệ: <a href="tel:1900xxxx" className="text-primary-600 font-semibold hover:underline">1900xxxx</a>
        </div>
      </div>
    </div>
  )
}

export default CompleteCheckout