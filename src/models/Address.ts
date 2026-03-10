export enum AddressType {
  Home = 1,
  ConstructionSite = 2,
  Warehouse = 3,
}

export interface AddressDto {
  id: number;
  receiverName: string;
  phone: string;
  street: string;
  provinceId: string;
  provinceName: string;
  wardId: string;
  wardName: string;
  type: AddressType;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateAddressRequest {
  receiverName: string;
  phone: string;
  street: string;
  provinceId: string;
  wardId: string;
  type: AddressType;
}

export interface UpdateAddressRequest {
  id: number;
  receiverName: string;
  phone: string;
  street: string;
  provinceId: string;
  wardId: string;
  type: AddressType;
}
