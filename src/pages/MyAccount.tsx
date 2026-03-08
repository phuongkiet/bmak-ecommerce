import { observer } from "mobx-react-lite";
import { useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, MapPin, User, Heart, LogOut, Trash2 } from "lucide-react";
import { useStore } from "@/store";
import { formatPrice } from "@/utils";
import UserOrdersTable from "@/components/Orders/UserOrdersTable";

type AccountTab = "overview" | "orders" | "address" | "account" | "favorites";

const menuItems: Array<{ key: AccountTab; label: string }> = [
  { key: "overview", label: "Trang tài khoản" },
  { key: "orders", label: "Đơn hàng" },
  { key: "address", label: "Địa chỉ" },
  { key: "account", label: "Tài khoản" },
  { key: "favorites", label: "Yêu thích" },
];

const MyAccount = observer(() => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { authStore, favoriteStore } = useStore();

  const tabFromQuery = (searchParams.get("tab") || "overview") as AccountTab;
  const activeTab: AccountTab = menuItems.some((item) => item.key === tabFromQuery)
    ? tabFromQuery
    : "overview";

  const setTab = (tab: AccountTab) => {
    if (tab === "overview") {
      setSearchParams({});
      return;
    }
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (activeTab === "favorites") {
      void favoriteStore.loadFavorites();
    }
  }, [activeTab, authStore.isAuthenticated, favoriteStore]);

  const handleRemoveFavorite = (productId: number) => {
    void favoriteStore.removeFavorite(productId);
  };

  const handleLogout = async () => {
    await authStore.logout();
    navigate("/");
  };

  const overviewCards = useMemo(
    () => [
      { key: "orders" as const, label: "ĐƠN HÀNG", icon: Box },
      { key: "address" as const, label: "ĐỊA CHỈ", icon: MapPin },
      { key: "account" as const, label: "TÀI KHOẢN", icon: User },
      { key: "favorites" as const, label: "YÊU THÍCH", icon: Heart },
      { key: "logout" as const, label: "THOÁT", icon: LogOut },
    ],
    [],
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className=" grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8 md:gap-10">
        <aside>
          <h1 className="text-xl font-bold mb-6">TÀI KHOẢN</h1>
          <div className="bg-white">
            {menuItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`w-full bg-[#f9fafb] text-left px-0 py-4 border-b border-gray-200 text-xl leading-tight ${
                  activeTab === item.key
                    ? "font-semibold text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full bg-[#f9fafb] text-left px-0 py-4 text-xl leading-tight text-gray-500 hover:text-red-600"
            >
              Đăng xuất
            </button>
          </div>
        </aside>

        <section>
          {activeTab === "overview" && (
            <div>
              <p className="text-gray-700 text-2xl leading-relaxed">
                Xin chào <strong>{authStore.userDisplayName}</strong>
                <span className="text-gray-500">
                  {" "}(không phải tài khoản <strong>{authStore.userDisplayName}</strong>? Hãy{" "}
                </span>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="text-primary-600 hover:underline"
                >
                  thoát ra
                </button>
                <span className="text-gray-500"> và đăng nhập vào tài khoản của bạn)</span>
              </p>
              <p className="text-gray-500 mt-6 text-xl leading-relaxed">
                Từ trang quản lý tài khoản bạn có thể xem{" "}
                <button
                  type="button"
                  onClick={() => setTab("orders")}
                  className="text-primary-600 hover:underline"
                >
                  đơn hàng mới
                </button>
                , quản lý{" "}
                <button
                  type="button"
                  onClick={() => setTab("address")}
                  className="text-primary-600 hover:underline"
                >
                  địa chỉ giao hàng và thanh toán
                </button>
                , and{" "}
                <button
                  type="button"
                  onClick={() => setTab("account")}
                  className="text-primary-600 hover:underline"
                >
                  sửa mật khẩu và thông tin tài khoản
                </button>
                .
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 mt-12">
                {overviewCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => {
                        if (card.key === "logout") {
                          void handleLogout();
                        } else {
                          setTab(card.key);
                        }
                      }}
                      className="flex flex-col items-center justify-center py-8 text-gray-700 hover:text-primary-600"
                    >
                      <Icon size={69} className="text-gray-300" />
                      <span className="mt-6 text-lg font-medium">{card.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "favorites" && (
            <div>
              <h2 className="text-4xl font-bold mb-6">Sản phẩm yêu thích</h2>
              {favoriteStore.isLoading ? (
                <p className="text-gray-500">Đang tải danh sách yêu thích...</p>
              ) : favoriteStore.favoriteProducts.length === 0 ? (
                <div className="border border-gray-200 rounded-lg p-6 bg-white">
                  <p className="text-gray-600 mb-3">Bạn chưa có sản phẩm yêu thích.</p>
                  <button
                    type="button"
                    onClick={() => navigate("/products")}
                    className="text-primary-600 hover:underline"
                  >
                    + Thêm sản phẩm yêu thích
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteStore.favoriteProducts.map((product) => (
                    <div key={product.productId} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex gap-4">
                        <img
                          src={product.thumbnail || "/images/default/no-image.png"}
                          alt={product.name}
                          className="w-24 h-24 object-contain bg-gray-50 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => navigate(`/products/${product.productId}`)}
                            className="text-left font-semibold text-gray-800 hover:text-primary-600 line-clamp-2"
                          >
                            {product.name}
                          </button>
                          <p className="mt-2 text-primary-600 font-semibold">{formatPrice(product.price)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFavorite(product.productId)}
                          className="text-gray-400 hover:text-red-500"
                          title="Xóa yêu thích"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <UserOrdersTable />
          )}

          {activeTab === "address" && (
            <div className="border border-gray-200 rounded-lg p-6 bg-white text-gray-600">
              Mục Địa chỉ sẽ được cập nhật sau.
            </div>
          )}

          {activeTab === "account" && (
            <div className="border border-gray-200 rounded-lg p-6 bg-white text-gray-600">
              Mục Tài khoản sẽ được cập nhật sau.
            </div>
          )}
        </section>
      </div>
    </div>
  );
});

export default MyAccount;
