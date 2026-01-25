// Attribute khi tạo/cập nhật sản phẩm
export interface ProductAttributeCreateDto {
  attributeId: number
  value: string
  extraData?: string
}

// Attribute trả về trong PagedList<ProductDto>
export interface ProductAttributeDto {
  name: string
  value: string
  code: string
}