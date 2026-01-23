const Cart = () => {
  // Mock data - sẽ thay thế bằng state management sau
  const cartItems: any[] = []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">Giỏ hàng của bạn đang trống</p>
          <a
            href="/products"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Tiếp tục mua sắm
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Cart items sẽ được render ở đây */}
          <p className="text-gray-600">Các sản phẩm trong giỏ hàng sẽ hiển thị ở đây</p>
        </div>
      )}
    </div>
  )
}

export default Cart





