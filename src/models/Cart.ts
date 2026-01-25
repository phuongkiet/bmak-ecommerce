export interface ShoppingCart {
  id: string;
  items: CartItem[];
  totalPrice: number;
  totalSquareMeter: number;
}

export interface CartItem {
  productId: number;
  productName: string;
  productSlug: string;
  price: number;
  originalPrice: number;
  quantity: number;
  pictureUrl: string;
  saleUnit: string;
  priceUnit: string;
  conversionFactor: number;
  qiuantitySquareMeter: number;
}