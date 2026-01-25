import { useEffect, useState } from "react";
import ColorFilter from "@/components/Filters/ColorFilter";
import OriginFilter from "@/components/Filters/OriginFilter";
import PriceFilter from "@/components/Filters/PriceFilter";
import SizeFilter from "@/components/Filters/SizeFilter";
import SurfaceFilter from "@/components/Filters/SurfaceFilter";
import ProductCard from "@/components/Products/ProductCard";
import { useStore } from "@/store";
import { observer } from "mobx-react-lite";

const Products = observer(() => {
  const { productStore } = useStore();
  const { productSummaries, minPrice, maxPrice, filters, isLoading, error } = productStore;
  
  // Filter state
  const [selectedFilters, setSelectedFilters] = useState<{
    minPrice?: number;
    maxPrice?: number;
    color?: string;
    size?: string;
  }>({});

  // Fetch products on mount
  useEffect(() => {
    productStore.fetchProductsPaged({ pageIndex: 1, pageSize: 12 });
  }, [productStore]);

  // Refetch when filters change
  const applyFilters = (newFilters: typeof selectedFilters) => {
    setSelectedFilters(newFilters);
    productStore.fetchProductsPaged({
      pageIndex: 1,
      pageSize: 12,
      ...newFilters,
    });
  };

  // Map ProductSummaryDto to ProductCard format
  const products = productSummaries.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.thumbnail || "/placeholder-product.png",
    price: p.price ?? p.originalPrice ?? 0,
  }));

  const handlePriceChange = (range: number[]) => {
    applyFilters({
      ...selectedFilters,
      minPrice: range[0],
      maxPrice: range[1],
    });
  };
  
  const handleColorChange = (color: string) => {
    applyFilters({
      ...selectedFilters,
      color,
    });
  };
  
  const handleSizeChange = (size: string) => {
    applyFilters({
      ...selectedFilters,
      size,
    });
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSelectedFilters({});
    productStore.fetchProductsPaged({
      pageIndex: 1,
      pageSize: 12,
    });
  };
  
  // Check if any filter is active
  const hasActiveFilters = Object.keys(selectedFilters).length > 0;
  
  return (
    <>
      <div className="grid grid-cols-12 mx-20">
        <div className="col-span-3 container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-3xl font-bold">Bộ lọc</h1>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium underline mt-3"
              >
                Xóa lọc
              </button>
            )}
          </div>
          <div className="space-y-6">
            {/* Giá */}
            <PriceFilter
              min={minPrice}
              max={maxPrice}
              onChange={handlePriceChange}
            />
            <hr />
            {/* Màu sắc */}
            <ColorFilter
              options={filters?.attributes.find((a) => a.code === "COLOR")?.options || []}
              selectedColor={selectedFilters.color}
              onChange={handleColorChange}
            />
            <hr />
            {/* Xuất xứ */}
            <OriginFilter />
            <hr />
            {/* Kích thước */}
            <SizeFilter
              options={filters?.attributes.find((a) => a.code === "SIZE")?.options || []}
              selectedSize={selectedFilters.size}
              onChange={handleSizeChange}
            />
            <hr />
            {/* Bề mặt */}
            <SurfaceFilter />
            <hr />
          </div>
        </div>
        <div className="col-span-9 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Tất cả sản phẩm</h1>
          {isLoading ? (
            <div className="py-16 text-center text-gray-500">Đang tải sản phẩm...</div>
          ) : error ? (
            <div className="py-8 text-center text-red-600">{error}</div>
          ) : (
            <ProductCard products={products} />
          )}
        </div>
      </div>
    </>
  );
});

export default Products;
