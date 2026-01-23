import { ReactNode } from 'react'
import CustomerHeader from './customer/CustomerHeader'
import CustomerFooter from './customer/CustomerFooter'

interface CustomerLayoutProps {
  children: ReactNode
}

const CustomerLayout = ({ children }: CustomerLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader />
      <main className="flex-grow">
        {children}
      </main>
      <CustomerFooter />
    </div>
  )
}

export default CustomerLayout





