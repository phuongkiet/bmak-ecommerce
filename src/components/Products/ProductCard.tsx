import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  products: {
    id: number;
    name: string;
    image: string;
    price: number;
  }[];
}

const ProductCard = ({ products }: ProductCardProps) => {
  const navigate = useNavigate();

  const handleViewDetail = (productId: number) => {
    console.log("Đang chọn sản phẩm với ID:", productId);
    navigate(`/products/${productId}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <div key={index}>
          <div className="w-full h-48 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer">
            <img
              src={product.image}
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
              {product.name.length > 20
                ? product.name.slice(0, 20) + "..."
                : product.name}
            </h3>
            <p className="text-primary-600 font-bold mt-2">
              {product.price.toLocaleString("vi-VN")} đ
            </p>
            <button
              className="mt-2 px-3 py-2 bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              onClick={() => {
                handleViewDetail(product.id);
              }}
            >
              <span className="text-sm font-semibold">Xem chi tiết</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCard;
