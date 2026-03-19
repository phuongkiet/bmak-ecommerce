import { useNavigate } from "react-router-dom";
import { Eye, Heart } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/store";
import { useEffect, useState } from "react";
import QuickViewModal from "./QuickViewModal";
import { toProxiedImageUrl } from "@/utils/imageProxy";

interface ProductCardProps {
  products: {
    id: number;
    name: string;
    image: string;
    price: number;
  }[];
}

const ProductCard = observer(({ products }: ProductCardProps) => {
  const navigate = useNavigate();
  const { favoriteStore, authStore } = useStore();
  const [quickViewProductId, setQuickViewProductId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    void favoriteStore.loadFavorites();
  }, [favoriteStore, authStore.isAuthenticated]);

  const handleViewDetail = (productId: number) => {
    console.log("Đang chọn sản phẩm với ID:", productId);
    navigate(`/products/${productId}`);
  };

  const handleFavoriteToggle = async (productId: number) => {
    await favoriteStore.toggleFavorite(productId);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product, index) => {
        const isFavorite = favoriteStore.isFavorite(product.id);

        return (
          <div key={index}>
            <div className="w-full h-48 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer">
              <img
                src={toProxiedImageUrl(product.image) || "/images/default/no-image.png"}
                alt={product.name}
                className="w-full h-48 object-contain rounded-lg"
                onClick={() => {
                  handleViewDetail(product.id);
                }}
              />
            </div>
            <div className="flex flex-col justify-center items-center p-4 ">
              <h3
                className="font-semibold text-sm cursor-pointer hover:text-primary-600"
                onClick={() => {
                  handleViewDetail(product.id);
                }}
              >
                {product.name.length > 15
                  ? product.name.slice(0, 15) + "..."
                  : product.name}
              </h3>
              <p className="text-primary-600 font-bold mt-2">
                {product.price.toLocaleString("vi-VN")} đ
              </p>
              <div className="relative mt-2 flex items-center justify-center group">
                <button
                  className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  onClick={() => {
                    handleViewDetail(product.id);
                  }}
                >
                  <span className="text-sm font-semibold">Xem chi tiết</span>
                </button>

                <button
                  type="button"
                  className="group/favorite absolute right-full mr-2 h-10 w-10 border border-gray-300 bg-white text-primary-600 flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                  aria-label="Yêu thích"
                  onClick={() => {
                    void handleFavoriteToggle(product.id);
                  }}
                >
                  <Heart size={20} className={isFavorite ? "fill-current" : ""} />
                  <span className="pointer-events-none absolute bottom-full mb-2 whitespace-nowrap bg-black px-2 py-1 text-xs text-white opacity-0 group-hover/favorite:opacity-100 transition-opacity">
                    {isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
                  </span>
                </button>

                <button
                  type="button"
                  className="group/quick absolute left-full ml-2 h-10 w-10 bg-primary-500 text-white flex items-center justify-center opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                  aria-label="Xem nhanh"
                  onClick={() => {
                    setQuickViewProductId(product.id);
                  }}
                >
                  <Eye size={20} />
                  <span className="pointer-events-none absolute bottom-full mb-2 whitespace-nowrap bg-black px-2 py-1 text-xs text-white opacity-0 group-hover/quick:opacity-100 transition-opacity">
                    Xem nhanh
                  </span>
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <QuickViewModal
        isOpen={quickViewProductId !== null}
        productId={quickViewProductId}
        onClose={() => {
          setQuickViewProductId(null);
        }}
        onViewDetail={(productId) => {
          setQuickViewProductId(null);
          handleViewDetail(productId);
        }}
      />
    </div>
  );
});

export default ProductCard;
