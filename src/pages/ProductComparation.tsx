import { observer } from "mobx-react-lite";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import * as productApi from "@/agent/api/productApi";
import type { ProductDto } from "@/models/Product";
import { formatPrice } from "@/utils";
import {
  getComparedProductIds,
  removeProductFromCompare,
} from "@/utils/compareStorage";
import { toProxiedImageUrl } from "@/utils/imageProxy";

const ProductComparation = () => {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [comparedIds, setComparedIds] = useState<number[]>(() =>
    getComparedProductIds(),
  );

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        if (comparedIds.length === 0) {
          setProducts([]);
          return;
        }

        const results = await Promise.allSettled(
          comparedIds.map((productId) => productApi.getProductById(productId)),
        );

        const loadedProducts = results
          .map((result) => (result.status === "fulfilled" ? result.value : null))
          .filter((product): product is ProductDto => Boolean(product));

        const ordered = comparedIds
          .map((id) => loadedProducts.find((item) => item.id === id))
          .filter((item): item is ProductDto => Boolean(item));

        setProducts(ordered);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProducts();
  }, [comparedIds]);

  const handleRemoveProduct = (productId: number) => {
    const nextIds = removeProductFromCompare(productId);
    setComparedIds(nextIds);
    setProducts((prev) => prev.filter((item) => item.id !== productId));
  };

  const rows = useMemo(() => {
    const rowMap = new Map<string, string[]>();

    products.forEach((product, productIndex) => {
      product.attributes?.forEach((attr) => {
        const key = attr.name || attr.code || "Thuộc tính";
        const values = rowMap.get(key) || Array(products.length).fill("-");
        values[productIndex] = attr.value || "-";
        rowMap.set(key, values);
      });
    });

    return Array.from(rowMap.entries()).map(([label, values]) => ({
      label,
      values,
    }));
  }, [products]);

  const compareSlots = 3;
  const emptySlots = Math.max(0, compareSlots - products.length);

  const renderColorSwatch = (value: string) => {
    const normalized = value.trim().toLowerCase();
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

    const colorValue = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized)
      ? normalized
      : colorMap[normalized];

    if (!colorValue) return value;

    return (
      <div className="flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border border-gray-300"
          style={{ backgroundColor: colorValue }}
          title={value}
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">So sánh sản phẩm</h1>

      {isLoading ? (
        <div className="text-gray-500">Đang tải dữ liệu so sánh...</div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded p-6">
          <p className="text-gray-600 mb-3">Chưa có sản phẩm nào trong danh sách so sánh.</p>
          <Link to="/products" className="text-primary-600 hover:underline font-medium">
            + Thêm sản phẩm
          </Link>
        </div>
      ) : (
        <div className="border border-gray-200 bg-white overflow-x-auto">
          <div className="grid" style={{ gridTemplateColumns: `240px repeat(${compareSlots}, minmax(200px, 1fr))` }}>
            <div className="p-4 border-r border-b border-gray-200 font-semibold">
              So sánh sản phẩm
            </div>

            {products.map((product) => (
              <div key={product.id} className="p-4 border-r border-b border-gray-200 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(product.id)}
                  className="absolute top-2 right-2 bg-gray-500 text-white rounded-full p-1 hover:bg-gray-600"
                  title="Xóa khỏi so sánh"
                >
                  <X size={14} />
                </button>
                <img
                  src={toProxiedImageUrl(product.thumbnail) || toProxiedImageUrl(product.images?.[0]?.url) || "/images/default/no-image.png"}
                  alt={product.name}
                  className="w-full h-48 object-contain bg-gray-50 mb-3"
                />
                <h3 className="font-bold text-xl leading-tight mb-3">{product.name}</h3>
                <div className="flex items-center gap-2 text-sm">
                  {product.originalPrice && (
                    <span className="line-through text-gray-400">{formatPrice(product.originalPrice)}</span>
                  )}
                  <span className="font-semibold text-gray-800">{formatPrice(product.price)}</span>
                </div>
              </div>
            ))}

            {Array.from({ length: emptySlots }).map((_, index) => (
              <div key={`empty-${index}`} className="p-4 border-r border-b border-gray-200 flex flex-col items-center justify-center text-gray-500">
                <Link to="/products" className="border border-gray-300 rounded-2xl w-16 h-16 flex items-center justify-center text-4xl font-light hover:text-primary-600 hover:border-primary-500">
                  +
                </Link>
                <span className="mt-3 text-sm">Thêm sản phẩm</span>
              </div>
            ))}

            <div className="p-4 border-r border-gray-200 font-semibold">Thuộc tính</div>
            {Array.from({ length: compareSlots }).map((_, index) => (
              <div key={`attr-header-${index}`} className="p-4 border-r border-gray-200" />
            ))}

            {rows.length === 0 ? (
              <>
                <div className="p-4 border-r border-t border-gray-200 text-gray-500">
                  Không có thuộc tính để so sánh
                </div>
                {Array.from({ length: compareSlots }).map((_, index) => (
                  <div key={`empty-row-${index}`} className="p-4 border-r border-t border-gray-200 text-gray-400 text-center">
                    -
                  </div>
                ))}
              </>
            ) : (
              rows.map((row) => (
                <Fragment key={row.label}>
                  <div key={`${row.label}-label`} className="p-4 border-r border-t border-gray-200 text-gray-700">
                    {row.label}
                  </div>
                  {Array.from({ length: compareSlots }).map((_, index) => {
                    const value = row.values[index] || "-";
                    const isColorRow = row.label.toLowerCase().includes("màu");
                    return (
                      <div key={`${row.label}-${index}`} className="p-4 border-r border-t border-gray-200 text-gray-700">
                        {isColorRow && value !== "-" ? renderColorSwatch(value) : value}
                      </div>
                    );
                  })}
                </Fragment>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(ProductComparation);