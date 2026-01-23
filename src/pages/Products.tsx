import ColorFilter from "@/components/Filters/ColorFilter";
import OriginFilter from "@/components/Filters/OriginFilter";
import PriceFilter from "@/components/Filters/PriceFilter";
import SizeFilter from "@/components/Filters/SizeFilter";
import SurfaceFilter from "@/components/Filters/SurfaceFilter";
import ProductCard from "@/components/Products/ProductCard";

// Mock data - sẽ thay thế bằng API sau
const products = [
  {
    id: 1,
    name: "HCMC1.51ST – 60 x 120 cm – STONE GẠCH VÂN ĐÁ GRANITE XÁM 01 BÓNG KÍNH – MÀI MEN PORCELAIN GỐM SỨ THÂN GẠCH HẠT MÈ",
    price: 299000,
    image: "https://ankhanhhouse.com/wp-content/uploads/2026/01/HCMC1.113WO1-300x300.webp",
  },
  {
    id: 2,
    name: "Sản phẩm 2",
    price: 399000,
    image: "https://ankhanhhouse.com/wp-content/uploads/2026/01/SG-66.609MHCMC1.57ST1-300x300.webp",
  },
  {
    id: 3,
    name: "Sản phẩm 3",
    price: 499000,
    image: "https://ankhanhhouse.com/wp-content/uploads/2026/01/SG-66.616MHCMC1.63ST1-300x300.webp",
  },
  {
    id: 4,
    name: "Sản phẩm 4",
    price: 599000,
    image: "https://ankhanhhouse.com/wp-content/uploads/2025/12/TRAVERTINEBEIGESG-612.061M2-300x300.webp",
  },
];

const Products = () => {
  return (
    <>
      <div className="grid grid-cols-12 mx-20">
        <div className="col-span-3 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-3">Bộ lọc</h1>
          {/* Bộ lọc sẽ được thêm vào đây sau */}
          <div className="space-y-6">
            {/* Giá */}
            <PriceFilter/>
            <hr/>
            {/* Màu sắc */}
            <ColorFilter/>
            <hr/>
            {/* Xuất xứ */}
            <OriginFilter/>
            <hr/>
            {/* Kích thước */}
            <SizeFilter/>
            <hr/>
            {/* Bề mặt */}
            <SurfaceFilter/>
            <hr/>
          </div>
        </div>
        <div className="col-span-9 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Tất cả sản phẩm</h1>
          <ProductCard products={products} />
        </div>
      </div>
    </>
  );
};

export default Products;
