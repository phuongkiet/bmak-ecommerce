import { Link } from 'react-router-dom'

const AdminHeader = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-4">
        <Link to="/admin" className="flex items-center">
          <span className="text-2xl font-bold text-primary-600">BMak</span>
        </Link>
      </div>
    </header>
  )
}

export default AdminHeader

