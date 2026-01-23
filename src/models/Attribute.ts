export interface Attribute {
  id: number
  name: string
  code: string
}

export interface CreateAttributeCommand {
  name: string
  code: string
}

export interface ProductAttribute {
  value: string
  extraData?: string
  productId: number
  attributeId: number
}





