import { Navigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

const ProtectedRoute = observer(({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { authStore } = useStore()

  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && authStore.user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
})

export default ProtectedRoute





