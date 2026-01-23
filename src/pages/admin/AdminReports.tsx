const AdminReports = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Báo cáo</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Báo cáo doanh thu</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có dữ liệu</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Báo cáo sản phẩm</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có dữ liệu</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminReports





