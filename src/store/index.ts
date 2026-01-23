import React, { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import RootStore from './RootStore'
import { apiClient } from '@/agent/api/apiClient'

// Tạo instance của RootStore
const rootStore = new RootStore()

// Setup token getter for apiClient
apiClient.setTokenGetter(() => rootStore.commonStore.getToken())

// Tạo React Context
const StoreContext = createContext<RootStore | null>(null)

// Hook để sử dụng store trong components
export const useStore = () => {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return store
}

// Provider component
export const StoreProvider = ({ children }: { children: ReactNode }) => {
  return React.createElement(
    StoreContext.Provider,
    { value: rootStore },
    children
  )
}

export default rootStore

