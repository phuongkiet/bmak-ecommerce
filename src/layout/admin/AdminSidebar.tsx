import { NavLink } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  FileText,
  FileEdit,
} from "lucide-react";

const AdminSidebar = observer(() => {

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Bảng điều khiển" },
    { path: "/admin/media", icon: FileText, label: "Thư viện ảnh" },
    { path: "/admin/products", icon: Package, label: "Sản phẩm" },
    { path: "/admin/categories", icon: FileText, label: "Danh mục sản phẩm" },
    { path: "/admin/customers", icon: Users, label: "Quản lý người dùng" },
    { path: "/admin/orders", icon: ShoppingCart, label: "Đơn hàng" },
    { path: "/admin/reports", icon: BarChart3, label: "Báo cáo" },
    { path: "/admin/pages", icon: FileEdit, label: "Trang" },
    { path: "/admin/settings", icon: Settings, label: "Cài đặt" },
  ];


  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
      {/* Logo Section */}
      <div className="px-6 py-6 border-b border-gray-100">
        <NavLink to="/admin" className="flex items-center">
          <span className="text-gray-800 font-bold text-xl">BMAK Store</span>
        </NavLink>
      </div>

      <nav className="px-4 py-4">
        <div className="text-gray-400 text-xs font-medium uppercase mb-4 px-4">
          MENU
        </div>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-600 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <Icon size={20} />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </aside>
  );
});

export default AdminSidebar;
