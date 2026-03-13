import { useStore } from "@/store";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatPrice } from "@/utils";
import { observer } from "mobx-react-lite";
import ProductExtraInfoTabs from "@/components/Products/ProductExtraInfoTabs";
import { Checkbox } from "@mui/material";
import {
  addProductToCompare,
  isProductCompared,
  removeProductFromCompare,
} from "@/utils/compareStorage";
import { Heart } from "lucide-react";

const ProductDetail = observer(() => {
  const { id } = useParams();
  const { productStore, cartStore, favoriteStore, authStore } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [isComparing, setIsComparing] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      // Clear old product before fetching new one
      productStore.clearSelectedProduct();
      productStore.fetchProductById(Number(id));
    }

    // Cleanup when unmounting
    return () => {
      productStore.clearSelectedProduct();
    };
  }, [id, productStore]);

  const product = productStore.selectedProduct;

  const mainImage = useMemo(
    () =>
      product?.thumbnail ||
      product?.images?.[0]?.url ||
      "/images/default/no-image.png",
    [product],
  );

  const hasDiscount =
    product?.originalPrice && product.originalPrice > (product.price ?? 0);

  const displayPriceUnit = useMemo(() => {
    const unit = product?.priceUnit || "";
    return unit.replace("m2", "m²").replace("m3", "m³");
  }, [product?.priceUnit]);

  const totalByUnit = useMemo(() => {
    const factor = Number(product?.conversionFactor ?? 1);
    const safeFactor = Number.isFinite(factor) && factor > 0 ? factor : 1;
    return quantity * safeFactor;
  }, [product?.conversionFactor, quantity]);

  const maxQuantity = useMemo(() => {
    if (!product) return 1;
    return product.stockQuantity > 0 ? product.stockQuantity : 1;
  }, [product]);

  const isOutOfStock = (product?.stockQuantity ?? 0) <= 0;

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
    if (/^rgb\(/i.test(normalized) || /^hsl\(/i.test(normalized))
      return normalized;

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

  useEffect(() => {
    setQuantity(1);
  }, [product?.id]);

  useEffect(() => {
    if (!product?.id) {
      setIsComparing(false);
      return;
    }

    setIsComparing(isProductCompared(product.id));
  }, [product?.id]);

  useEffect(() => {
    if (!product?.id) return;

    if (isAddingToCart || isOutOfStock) {
      console.info("[ProductDetail] Add-to-cart disabled", {
        productId: product.id,
        stockQuantity: product.stockQuantity,
        isOutOfStock,
        isAddingToCart,
        quantity,
        maxQuantity,
      });
    }
  }, [product?.id, product?.stockQuantity, isOutOfStock, isAddingToCart, quantity, maxQuantity]);

  useEffect(() => {
    void favoriteStore.loadFavorites();
  }, [favoriteStore, authStore.isAuthenticated]);

  const handleCompareToggle = () => {
    if (!product?.id) return;

    if (isComparing) {
      removeProductFromCompare(product.id);
      setIsComparing(false);
      return;
    }

    addProductToCompare(product.id);
    setIsComparing(true);
  };

  const handleFavoriteToggle = async () => {
    if (!product?.id) return;
    await favoriteStore.toggleFavorite(product.id);
  };

  const handleAddToCart = async () => {
    if (!product?.id) return;
    setIsAddingToCart(true);
    try {
      await cartStore.addItem(product.id, quantity);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (productStore.isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-gray-500">
        Đang tải...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-gray-500">
        Không tìm thấy sản phẩm
      </div>
    );
  }

  const isFavorite = favoriteStore.isFavorite(product.id);

  // Warn if product ID doesn't match URL (defensive check)
  if (id && product.id !== Number(id)) {
    console.warn(`Product ID mismatch: URL=${id}, Loaded=${product.id}`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full rounded-lg shadow-md"
          />
        </div>

        <div className="md:col-span-5">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="flex items-center gap-3 mb-6">
            {hasDiscount && (
              <p className="text-xl text-gray-400 line-through">
                {formatPrice(product.originalPrice!)}
              </p>
            )}
            <p className="text-3xl text-primary-600 font-bold">
              {formatPrice(product.price)}{" "}
              {product.priceUnit && (
                <span className="text-3xl text-primary-600">
                  / {displayPriceUnit}
                </span>
              )}
            </p>
          </div>

          {product.shortDescription && (
            <div
              className="prose prose-sm max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />
          )}

          {/* Specs từ attributes
          {product.attributes?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Thuộc tính</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                {product.attributes.map((attr) => (
                  <div
                    key={`${attr.code}-${attr.value}`}
                    className="flex justify-between"
                  >
                    <span className="font-medium">{attr.name}:</span>
                    <span>{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* Specs từ JSON
          {specs && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Thông số kỹ thuật</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{key}:</span>
                    <span>{value as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <div>Mã: {product.sku}</div>
            {/* <div>Đơn vị bán: {product.salesUnit} ({product.priceUnit})</div> */}
            {/* <div>Tồn kho: {product.stockQuantity}</div> */}
            <div>Danh mục: {product.categoryName}</div>
            <div>Số viên 1 thùng: {product.boxQuantity}</div>
            <div>Trọng lượng 1 viên: {product.weight}</div>
            <div>Độ dày: {product.thickness}</div>
            <div>Số lượng vân: {product.random}</div>
            <div className="grid grid-cols-[90px_1fr] gap-y-2 items-center">
              {sizeValue && (
                <>
                  <span>Kích thước:</span>
                  <div className="rounded-full bg-cyan-400 outline border border-black text-white font-semibold px-7 py-1 justify-self-start text-center">
                    {sizeValue}
                  </div>
                </>
              )}

              {surfaceValue && (
                <>
                  <span>Bề mặt:</span>
                  <div className="rounded-full bg-cyan-400 outline border border-black  text-white font-semibold px-7 py-1 justify-self-start text-center">
                    {surfaceValue}
                  </div>
                </>
              )}

              {materialValue && (
                <>
                  <span>Chất liệu:</span>
                  <div className="rounded-full bg-cyan-400 outline border border-black text-white font-semibold px-7 py-1 justify-self-start text-center">
                    {materialValue}
                  </div>
                </>
              )}

              {originValue && (
                <>
                  <span>Xuất xứ:</span>
                  <div className="rounded-full bg-cyan-400 outline border border-black text-white font-semibold px-7 py-1 justify-self-start text-center">
                    {originValue}
                  </div>
                </>
              )}

              {colorValue && (
                <>
                  <span>Màu sắc:</span>
                  <div
                    className="w-8 h-8 rounded-full border border-black justify-self-start"
                    style={{ backgroundColor: resolveColorValue(colorValue) }}
                    title={colorValue}
                    aria-label={`Màu sắc: ${colorValue}`}
                  >
                    <span className="sr-only">{colorValue}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <hr className="my-4" />
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4 border border-gray-300 px-2 py-1.5 flex items-center justify-between">
                <span className="text-gray-600 text-md">
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
                    className="text-center border-y border-gray-300 font-bold text-base items-center focus:outline-none"
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
              <div className="col-span-5 w-full">
                <button
                  className="w-full bg-primary-600 text-white py-2 px-4 font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
                  onClick={() => void handleAddToCart()}
                  disabled={isAddingToCart || isOutOfStock}
                >
                  {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                </button>
              </div>
            </div>
            <hr />
          </div>
          <div className="flex items-center gap-6">
            <div>
              <Checkbox
                color="primary"
                checked={isComparing}
                onChange={handleCompareToggle}
              />
              {isComparing ? (
                <Link
                  to="/compare"
                  className="text-primary-500 hover:underline"
                >
                  Xem so sánh
                </Link>
              ) : (
                <span className="text-primary-500">So sánh</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Heart
                onClick={() => void handleFavoriteToggle()}
                className={`ml-4 cursor-pointer ${
                  isFavorite
                    ? "text-red-500 fill-red-500"
                    : "text-gray-500 hover:text-red-500"
                }`}
              />
              {isFavorite ? (
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
          </div>
        </div>
      </div>

      <ProductExtraInfoTabs product={product} />
    </div>
  );
});

export default ProductDetail;
