import { ReactNode, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import CustomerHeader from './customer/CustomerHeader'
import CustomerFooter from './customer/CustomerFooter'

interface CustomerLayoutProps {
  children: ReactNode
}

const CustomerLayout = observer(({ children }: CustomerLayoutProps) => {
  const { adminSettingStore } = useStore()

  useEffect(() => {
    if (adminSettingStore.setting || adminSettingStore.isLoading) return
    void adminSettingStore.fetchSetting()
  }, [adminSettingStore])

  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader />
      <main className="flex-grow">
        {children}
      </main>
      <CustomerFooter />
    </div>
  )
})

export default CustomerLayout





