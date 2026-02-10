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

  if (requireAdmin && authStore.user?.roles?.includes('admin') !== true) {
  {
    // Support both shapes: stored user may have `role` string or `roles` array (from AuthResponse)
    const hasAdminRole = (() => {
      try {
        if (!authStore.user) return false
        // check role string
        if ((authStore.user as any).role && String((authStore.user as any).role).toLowerCase() === 'admin') return true
        // check roles array
        const roles = (authStore.user as any).roles
        if (Array.isArray(roles) && roles.map((r: any) => String(r).toLowerCase()).includes('admin')) return true
        return false
      } catch {
        return false
      }
    })()

    if (!hasAdminRole) return <Navigate to="/" replace />
  }
  }

  return <>{children}</>
})

export default ProtectedRoute





