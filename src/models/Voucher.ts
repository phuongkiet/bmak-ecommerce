export interface VoucherDto {
  id: number;
  code: string;
  name?: string;
  description?: string;
  discountType?: string | number;
  discountValue?: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usedCount?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface PagedList<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface VoucherSpecParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  code?: string;
  isActive?: boolean;
  sort?: string;
}

export interface CreateVoucherCommand {
  code: string;
  name?: string;
  description?: string;
  discountType: number;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface UpdateVoucherCommand extends CreateVoucherCommand {
  id: number;
}

export interface ToggleVoucherStatusCommand {
  id?: number;
  isActive: boolean;
}

export interface ApplyVoucherQuery {
  code: string;
  cartId: string;
}

export interface VoucherResponseDto {
  isValid?: boolean;
  discountAmount?: number;
  finalAmount?: number;
  message?: string;
  voucher?: VoucherDto;
}
