import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import { Image as Layout } from 'lucide-react'


const AdminPages = observer(() => {
  const { pageType } = useParams<{ pageType: string }>()
  const navigate = useNavigate()
  const { pageStore } = useStore()

  // 1. Load data ban đầu
  useEffect(() => {
    pageStore.loadPages()
  }, [pageStore])

  // 2. Load chi tiết page khi chọn slug
  useEffect(() => {
    if (pageType && !currentPage) {
      pageStore.getPageBySlugFromApi(pageType)
    }
  }, [pageType, pageStore])

  // 3. Lấy page từ store (có thể là summary hoặc detail tùy lúc)
  const currentPageSummary = pageType ? pageStore.getPageBySlug(pageType) : null
  const currentPageDetail = pageStore.selectedPage
  
  // Dùng detail nếu có, không thì dùng summary
  const currentPage = currentPageDetail || currentPageSummary
  
  // // 4. Sync dữ liệu từ store vào local state khi chọn trang
  // useEffect(() => {
  //   if (currentPageDetail && currentPageDetail.sections) {
  //     // Deep clone để ngắt tham chiếu
  //     setLocalSections(JSON.parse(JSON.stringify(currentPageDetail.sections)))
  //   }
  // }, [currentPageDetail])

  // --- RENDER DANH SÁCH TRANG (Dashboard) ---
  if (!pageType) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản lý giao diện</h1>
        
        {/* Loading State */}
        {pageStore.isLoading && pageStore.pages.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải danh sách trang...</p>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {pageStore.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">❌ Lỗi: {pageStore.error}</p>
          </div>
        )}
        
        {/* Empty State */}
        {!pageStore.isLoading && pageStore.pages.length === 0 && !pageStore.error && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
            <Layout className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600 font-medium">Chưa có trang nào</p>
            <p className="text-gray-500 text-sm mt-2">Hãy tạo trang mới từ backend</p>
          </div>
        )}
        
        {/* Pages Table */}
        {pageStore.pages.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cập nhật</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pageStore.pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{page.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{page.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{page.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(page.updatedAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => navigate(`/admin/pages/${page.slug}`)} className="text-primary-600 hover:underline mr-3">Sửa</button>
                      <button onClick={async () => {
                        if (!confirm('Bạn có chắc muốn xóa trang này?')) return
                        // try call API delete if exists on pageStore
                        if ((pageStore as any).deletePage) {
                          await (pageStore as any).deletePage(page.id)
                          pageStore.loadPages()
                        } else {
                          // fallback: call createNewPage with negative? just reload
                          pageStore.loadPages()
                        }
                      }} className="text-red-600 hover:underline">Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }
})

export default AdminPages