/**
 * Ví dụ sử dụng CommonStore
 * 
 * // Trong component:
 * import { observer } from 'mobx-react-lite'
 * import { useStore } from '@/store'
 * 
 * const MyComponent = observer(() => {
 *   const { commonStore } = useStore()
 * 
 *   // Lấy token
 *   const token = commonStore.getToken()
 * 
 *   // Set token
 *   commonStore.setToken('new-token')
 * 
 *   // Clear token
 *   commonStore.clearToken()
 * 
 *   // Theme
 *   commonStore.setTheme('dark')
 *   commonStore.toggleTheme()
 * 
 *   // Language
 *   commonStore.setLanguage('en')
 * 
 *   // Notifications
 *   commonStore.showSuccess('Thành công!')
 *   commonStore.showError('Có lỗi xảy ra!')
 *   commonStore.showInfo('Thông tin')
 *   commonStore.showWarning('Cảnh báo')
 * 
 *   return <div>...</div>
 * })
 */





