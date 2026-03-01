// Attribute khi tạo/cập nhật sản phẩm
export interface ProductAttributeCreateDto {
  attributeId: number
  attributeValueId: number
}

// Attribute trả về trong PagedList<ProductDto>
export interface ProductAttributeDto {
  attributeId: number
  name: string
  value: string
  code: string
}