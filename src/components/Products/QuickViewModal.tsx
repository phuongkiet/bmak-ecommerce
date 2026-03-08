import { useEffect, useMemo, useState } from "react";
import { Heart, X } from "lucide-react";
import { observer } from "mobx-react-lite";
import { getProductById } from "@/agent/api/productApi";
import type { ProductDto } from "@/models/Product";
import { useStore } from "@/store";
import { Link } from "react-router-dom";

interface QuickViewModalProps {
  isOpen: boolean;
  productId: number | null;
  onClose: () => void;
  onViewDetail: (productId: number) => void;
}

const QuickViewModal = observer(
  ({ isOpen, productId, onClose, onViewDetail }: QuickViewModalProps) => {
    const { cartStore, favoriteStore } = useStore();
    const [product, setProduct] = useState<ProductDto | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState<string>("");

    useEffect(() => {
      if (!isOpen || !productId) return;

      const loadProduct = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const data = await getProductById(productId);
          setProduct(data);
          setQuantity(1);
          setActiveImage(data.thumbnail || data.images?.[0]?.url || "");
        } catch {
          setError("Không thể tải thông tin sản phẩm.");
          setProduct(null);
        } finally {
          setIsLoading(false);
        }
      };

      void loadProduct();
    }, [isOpen, productId]);

    useEffect(() => {
      if (!isOpen) {
        setProduct(null);
        setError(null);
        setQuantity(1);
        setActiveImage("");
      }
    }, [isOpen]);

    const galleryImages = useMemo(() => {
      if (!product) return [];

      const images = [product.thumbnail, ...(product.images?.map((item) => item.url) || [])]
        .filter((url): url is string => Boolean(url));

      return Array.from(new Set(images));
    }, [product]);

    const selectedImage = activeImage || galleryImages[0] || "/images/default/no-image.png";

    const hasDiscount =
      product?.originalPrice && product.originalPrice > (product.price ?? 0);

    const displayPriceUnit = useMemo(() => {
      const unit = product?.priceUnit || "";
      return unit.replace("m2", "m²").replace("m3", "m³");
    }, [product?.priceUnit]);

    const maxQuantity = useMemo(() => {
      if (!product) return 1;
      return product.stockQuantity > 0 ? product.stockQuantity : 1;
    }, [product]);

    const totalByUnit = useMemo(() => {
      const factor = Number(product?.conversionFactor ?? 1);
      const safeFactor = Number.isFinite(factor) && factor > 0 ? factor : 1;
      return quantity * safeFactor;
    }, [product?.conversionFactor, quantity]);

    const getAttrValue = (name: string) =>
      product?.attributes?.find((attr) => attr.name === name)?.value;

    const sizeValue = getAttrValue("Kích thước");
    const surfaceValue = getAttrValue("Bề mặt");
    const materialValue = getAttrValue("Chất liệu");
    const originValue = getAttrValue("Xuất xứ");
    const colorValue = getAttrValue("Màu sắc");

    const resolveColorValue = (value?: string) => {
      if (!value) return "#e5e7eb";
      const normalized = value.trim().toLowerCase();

      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized)) return normalized;
      if (/^rgb\(/i.test(normalized) || /^hsl\(/i.test(normalized)) return normalized;

      const colorMap: Record<string, string> = {
        trắng: "#f9fafb",
        den: "#111827",
        đen: "#111827",
        xám: "#9ca3af",
        ghi: "#9ca3af",
        xanh: "#3b82f6",
        "xanh dương": "#2563eb",
        "xanh lá": "#22c55e",
        đỏ: "#ef4444",
        vàng: "#facc15",
        kem: "#e7dfcf",
        be: "#d6cdbd",
        "nâu nhạt": "#bfa17a",
        nâu: "#8b5e3c",
        hồng: "#ec4899",
        tím: "#8b5cf6",
      };

      return colorMap[normalized] || "#e5e7eb";
    };

    const decreaseQuantity = () => {
      setQuantity((prev) => Math.max(1, prev - 1));
    };

    const increaseQuantity = () => {
      setQuantity((prev) => Math.min(maxQuantity, prev + 1));
    };

    const handleQuantityChange = (value: string) => {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) return;
      const normalized = Math.floor(parsed);
      setQuantity(Math.min(maxQuantity, Math.max(1, normalized)));
    };

    const handleAddToCart = async () => {
      if (!product?.id) return;
      await cartStore.addItem(product.id, quantity);
    };

    const handleFavoriteToggle = async () => {
      if (!product?.id) return;
      await favoriteStore.toggleFavorite(product.id);
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

        <div className="relative z-10 bg-white w-full max-w-6xl max-h-[92vh] overflow-y-auto border border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            aria-label="Đóng"
          >
            <X size={28} />
          </button>

          {isLoading ? (
            <div className="px-6 py-10 text-center text-gray-500">Đang tải sản phẩm...</div>
          ) : error ? (
            <div className="px-6 py-10 text-center text-red-500">{error}</div>
          ) : !product ? (
            <div className="px-6 py-10 text-center text-gray-500">Không có dữ liệu sản phẩm.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5 lg:p-6">
              <div>
                <div className="border border-gray-200 overflow-hidden">
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-[460px] object-contain"
                  />
                </div>

                {galleryImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    {galleryImages.slice(0, 4).map((imageUrl) => (
                      <button
                        key={imageUrl}
                        type="button"
                        onClick={() => setActiveImage(imageUrl)}
                        className={`border ${
                          selectedImage === imageUrl
                            ? "border-gray-900"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-24 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pr-2">
                <h2 className="text-3xl font-semibold text-gray-800 leading-tight mb-3">
                  {product.name}
                </h2>

                <div className="flex items-center gap-3 mb-2">
                  {hasDiscount && (
                    <p className="text-xl text-gray-400 line-through font-semibold">
                      đ {product.originalPrice!.toLocaleString("vi-VN")}
                    </p>
                  )}
                  <p className="text-2xl text-primary-500 font-bold">
                    đ {product.price.toLocaleString("vi-VN")}
                    {displayPriceUnit && (
                      <span className="text-2xl text-primary-500"> / {displayPriceUnit}</span>
                    )}
                  </p>
                </div>
                
                {product.shortDescription && (
                  <div
                    className="prose prose-sm max-w-none mb-4 text-gray-700"
                    dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                  />
                )}

                <div className="space-y-2 text-gray-700 mb-4">
                  <div>Mã: {product.sku}</div>
                  <div>Danh mục: {product.categoryName}</div>
                  <div>Số viên trong 1 thùng: {product.boxQuantity}</div>
                  <div>Trọng lượng 1 viên: {product.weight} kg</div>
                  <div>Độ dày: {product.thickness}mm</div>
                  <div>Số lượng vân: {product.random}</div>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-y-3 items-center mb-4">
                  {surfaceValue && (
                    <>
                      <span className="text-gray-700">Bề mặt:</span>
                      <div className="rounded-full bg-gray-800 text-white font-semibold px-5 py-1 justify-self-start text-center">
                        {surfaceValue}
                      </div>
                    </>
                  )}

                  {materialValue && (
                    <>
                      <span className="text-gray-700">Chất liệu:</span>
                      <div className="rounded-full bg-gray-800 text-white font-semibold px-5 py-1 justify-self-start text-center">
                        {materialValue}
                      </div>
                    </>
                  )}

                  {originValue && (
                    <>
                      <span className="text-gray-700">Xuất xứ:</span>
                      <div className="rounded-full bg-gray-800 text-white font-semibold px-5 py-1 justify-self-start text-center">
                        {originValue}
                      </div>
                    </>
                  )}

                  {colorValue && (
                    <>
                      <span className="text-gray-700">Màu sắc:</span>
                      <div
                        className="w-10 h-10 rounded-full border-2 border-primary-500 justify-self-start"
                        style={{ backgroundColor: resolveColorValue(colorValue) }}
                        title={colorValue}
                        aria-label={`Màu sắc: ${colorValue}`}
                      >
                        <span className="sr-only">{colorValue}</span>
                      </div>
                    </>
                  )}

                  {sizeValue && (
                    <>
                      <span className="text-gray-700">Kích thước:</span>
                      <div className="rounded-full bg-gray-800 text-white font-semibold px-5 py-1 justify-self-start text-center">
                        {sizeValue}
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="grid grid-cols-12 gap-3 items-stretch">
                    <div className="col-span-4 border border-gray-300 px-2 py-2 flex items-center justify-center">
                      <span className="text-gray-600 text-sm">
                        Tổng: {totalByUnit.toFixed(2)} {product.salesUnit}
                      </span>
                    </div>

                    <div className="col-span-3">
                      <div className="grid grid-cols-3 h-full min-h-[44px]">
                        <button
                          type="button"
                          className="border border-gray-300 bg-white text-gray-700 text-base leading-none"
                          onClick={decreaseQuantity}
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={maxQuantity}
                          value={quantity}
                          onChange={(e) => handleQuantityChange(e.target.value)}
                          className="text-center border-y border-gray-300 font-bold text-base focus:outline-none"
                        />
                        <button
                          type="button"
                          className="border border-gray-300 bg-white text-gray-700 text-base leading-none"
                          onClick={increaseQuantity}
                          disabled={quantity >= maxQuantity}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="col-span-5">
                      <button
                        type="button"
                        className="w-full h-full min-h-[44px] bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={() => void handleAddToCart()}
                        disabled={cartStore.isLoading || product.stockQuantity <= 0}
                      >
                        Thêm vào giỏ hàng
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-9">
                  <div className="flex items-center gap-2">
                    <Heart
                      onClick={() => void handleFavoriteToggle()}
                      className={`cursor-pointer ${
                        favoriteStore.isFavorite(product.id)
                          ? "text-red-500 fill-red-500"
                          : "text-gray-500 hover:text-red-500"
                      }`}
                    />
                    {favoriteStore.isFavorite(product.id) ? (
                      <Link
                        to="/profile?tab=favorites"
                        className="text-primary-500 hover:underline"
                      >
                        Đã yêu thích
                      </Link>
                    ) : (
                      <span className="text-primary-500">Yêu thích</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="text-primary-600 hover:underline font-medium"
                    onClick={() => {
                      onViewDetail(product.id);
                    }}
                  >
                    Xem chi tiết đầy đủ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default QuickViewModal;
