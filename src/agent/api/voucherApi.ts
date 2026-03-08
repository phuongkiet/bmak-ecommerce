import { apiClient, ApiResponse } from "./apiClient";
import {
  ApplyVoucherQuery,
  CreateVoucherCommand,
  PagedList,
  ToggleVoucherStatusCommand,
  UpdateVoucherCommand,
  VoucherDto,
  VoucherResponseDto,
  VoucherSpecParams,
} from "@/models/Voucher";

export const getVouchers = async (
  params?: VoucherSpecParams,
): Promise<PagedList<VoucherDto>> => {
  const queryParams = new URLSearchParams();

  if (params?.pageIndex) queryParams.append("pageIndex", params.pageIndex.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.code) queryParams.append("code", params.code);
  if (typeof params?.isActive === "boolean") {
    queryParams.append("isActive", params.isActive.toString());
  }
  if (params?.sort) queryParams.append("sort", params.sort);

  const queryString = queryParams.toString();
  const endpoint = `/Vouchers${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<ApiResponse<PagedList<VoucherDto>> | PagedList<VoucherDto>>(endpoint);

  if (response && typeof response === "object" && "items" in response && "pageIndex" in response) {
    return response as PagedList<VoucherDto>;
  }

  return (response as ApiResponse<PagedList<VoucherDto>>).value!;
};

export const getVoucherById = async (id: number): Promise<VoucherDto> => {
  const response = await apiClient.get<ApiResponse<VoucherDto> | VoucherDto>(`/Vouchers/${id}`);

  if (response && typeof response === "object" && "id" in response && "code" in response) {
    return response as VoucherDto;
  }

  return (response as ApiResponse<VoucherDto>).value!;
};

export const createVoucher = async (command: CreateVoucherCommand): Promise<number> => {
  const response = await apiClient.post<ApiResponse<number> | number>("/Vouchers", command);

  if (typeof response === "number") {
    return response;
  }

  return (response as ApiResponse<number>).value!;
};

export const updateVoucher = async (id: number, command: UpdateVoucherCommand): Promise<boolean> => {
  const response = await apiClient.put<ApiResponse<boolean> | boolean>(`/Vouchers/${id}`, command);

  if (typeof response === "boolean") {
    return response;
  }

  return !!(response as ApiResponse<boolean>).value;
};

export const toggleVoucherStatus = async (
  id: number,
  command: ToggleVoucherStatusCommand,
): Promise<boolean> => {
  const response = await apiClient.patch<ApiResponse<boolean> | boolean>(`/Vouchers/${id}/status`, command);

  if (typeof response === "boolean") {
    return response;
  }

  return !!(response as ApiResponse<boolean>).value;
};

export const deleteVoucher = async (id: number): Promise<boolean> => {
  const response = await apiClient.delete<ApiResponse<boolean> | boolean>(`/Vouchers/${id}`);

  if (typeof response === "boolean") {
    return response;
  }

  return !!(response as ApiResponse<boolean>).value;
};

export const applyVoucher = async (query: ApplyVoucherQuery): Promise<VoucherResponseDto> => {
  const response = await apiClient.post<ApiResponse<VoucherResponseDto> | VoucherResponseDto>(
    "/Vouchers/apply",
    query,
  );

  if (response && typeof response === "object" && "isSuccess" in response) {
    return (response as ApiResponse<VoucherResponseDto>).value || {};
  }

  return response as VoucherResponseDto;
};
