import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'

const NotificationContainer = observer(() => {
  const { commonStore } = useStore()

  if (commonStore.notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {commonStore.notifications.map((notification) => {
        const getIcon = () => {
          switch (notification.type) {
            case 'success':
              return <CheckCircle className="text-green-500" size={20} />
            case 'error':
              return <XCircle className="text-red-500" size={20} />
            case 'warning':
              return <AlertTriangle className="text-yellow-500" size={20} />
            case 'info':
              return <Info className="text-blue-500" size={20} />
          }
        }

        const getBgColor = () => {
          switch (notification.type) {
            case 'success':
              return 'bg-green-50 border-green-200'
            case 'error':
              return 'bg-red-50 border-red-200'
            case 'warning':
              return 'bg-yellow-50 border-yellow-200'
            case 'info':
              return 'bg-blue-50 border-blue-200'
          }
        }

        return (
          <div
            key={notification.id}
            className={`${getBgColor()} border rounded-lg shadow-lg p-4 min-w-[300px] max-w-md flex items-start gap-3 animate-slide-in`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => commonStore.removeNotification(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )
      })}
    </div>
  )
})

export default NotificationContainer





