import { useStore } from "@/store";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { formatPrice } from "@/utils";
import { observer } from "mobx-react-lite";

const ProductDetail = observer(() => {
  const { id } = useParams();
  const { productStore, cartStore } = useStore();
  const [quantity, setQuantity] = useState(1);

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
      "/placeholder-product.png",
    [product],
  );

  const specs = useMemo(() => {
    if (!product?.specificationsJson) return null;
    try {
      return JSON.parse(product.specificationsJson) as Record<string, string>;
    } catch (e) {
      console.warn("Invalid specificationsJson", e);
      return null;
    }
  }, [product?.specificationsJson]);

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

  // Warn if product ID doesn't match URL (defensive check)
  if (id && product.id !== Number(id)) {
    console.warn(`Product ID mismatch: URL=${id}, Loaded=${product.id}`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={mainImage}
            alt={product.name}
            className="w-full rounded-lg shadow-md"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="flex items-center gap-3 mb-6">
            <p className="text-3xl text-primary-600 font-bold">
              {formatPrice(product.price)}
            </p>
            {hasDiscount && (
              <p className="text-lg text-gray-400 line-through">
                {formatPrice(product.originalPrice!)}
              </p>
            )}
          </div>

          {product.description && (
            <p className="text-gray-700 mb-6">{product.description}</p>
          )}

          {/* Specs từ attributes */}
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
          )}

          {/* Specs từ JSON */}
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
          )}

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
              <span>Bề mặt:</span>
              <div className="rounded-full bg-cyan-400 outline text-white font-semibold p-2 justify-self-start text-center min-w-[160px]">
                {product.attributes?.find((attr) => attr.name === "Bề mặt")
                  ?.value || "Không xác định"}
              </div>

              <span>Chất liệu:</span>
              <div className="rounded-full bg-cyan-400 outline text-white font-semibold p-2 justify-self-start text-center min-w-[160px]">
                {product.attributes?.find((attr) => attr.name === "Chất liệu")
                  ?.value || "Không xác định"}
              </div>

              <span>Xuất xứ:</span>
              <div className="rounded-full bg-cyan-400 outline text-white font-semibold p-2 justify-self-start text-center min-w-[160px]">
                {product.attributes?.find((attr) => attr.name === "Xuất xứ")
                  ?.value || "Không xác định"}
              </div>

              <span>Màu sắc:</span>
              <div className="rounded-full bg-cyan-400 outline text-white font-semibold p-2 justify-self-start text-center min-w-[160px]">
                {product.attributes?.find((attr) => attr.name === "Màu sắc")
                  ?.value || "Không xác định"}
              </div>

              <span>Kích thước:</span>
              <div className="rounded-full bg-cyan-400 outline text-white font-semibold p-2 justify-self-start text-center min-w-[160px]">
                {product.attributes?.find((attr) => attr.name === "Kích thước")
                  ?.value || "Không xác định"}
              </div>
            </div>
          </div>
          <hr className="my-4" />
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4 border border-gray-300 px-2 py-1.5 flex items-center justify-between">
                <span className="text-gray-600 text-md">
                  Tổng: {totalByUnit.toFixed(2)} {displayPriceUnit}
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
                  onClick={() => cartStore.addItem(product.id, quantity)}
                  disabled={cartStore.isLoading || product.stockQuantity <= 0}
                >
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
            <hr />
            <button className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductDetail;
