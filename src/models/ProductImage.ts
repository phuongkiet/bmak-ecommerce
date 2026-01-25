// Hình ảnh sản phẩm (tùy BE có thể bổ sung thêm)
export interface ProductImageDto {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}