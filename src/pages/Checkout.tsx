const Checkout = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Họ và tên</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số điện thoại</label>
              <input
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Địa chỉ</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </form>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>0 đ</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span>0 đ</span>
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Tổng cộng:</span>
              <span className="text-primary-600">0 đ</span>
            </div>
            <button className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors mt-4">
              Đặt hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout





