import { apiClient, ApiResponse } from "./apiClient";
import {
  BusinessRuleDto,
  BusinessRuleSpecParams,
  CreateBusinessRuleCommand,
  PagedList,
  ToggleBusinessRuleStatusCommand,
  UpdateBusinessRuleCommand,
} from "@/models/BusinessRule";

export const getBusinessRules = async (
  params?: BusinessRuleSpecParams,
): Promise<PagedList<BusinessRuleDto>> => {
  const queryParams = new URLSearchParams();

  if (params?.pageIndex) queryParams.append("pageIndex", params.pageIndex.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (typeof params?.isActive === "boolean") queryParams.append("isActive", params.isActive.toString());

  const queryString = queryParams.toString();
  const endpoint = `/BusinessRules${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<
    ApiResponse<PagedList<BusinessRuleDto>> | PagedList<BusinessRuleDto>
  >(endpoint);

  if (response && typeof response === "object" && "items" in response && "pageIndex" in response) {
    return response as PagedList<BusinessRuleDto>;
  }

  return (response as ApiResponse<PagedList<BusinessRuleDto>>).value!;
};

export const getBusinessRuleById = async (id: number): Promise<BusinessRuleDto> => {
  const response = await apiClient.get<ApiResponse<BusinessRuleDto> | BusinessRuleDto>(
    `/BusinessRules/${id}`,
  );

  if (response && typeof response === "object" && "id" in response) {
    return response as BusinessRuleDto;
  }

  return (response as ApiResponse<BusinessRuleDto>).value!;
};

export const createBusinessRule = async (command: CreateBusinessRuleCommand): Promise<number> => {
  const response = await apiClient.post<ApiResponse<number> | number>("/BusinessRules", command);

  if (typeof response === "number") {
    return response;
  }

  return (response as ApiResponse<number>).value!;
};

export const updateBusinessRule = async (
  id: number,
  command: UpdateBusinessRuleCommand,
): Promise<boolean> => {
  const response = await apiClient.put<ApiResponse<boolean> | boolean>(`/BusinessRules/${id}`, command);

  if (typeof response === "boolean") {
    return response;
  }

  return !!(response as ApiResponse<boolean>).value;
};

export const toggleBusinessRuleStatus = async (
  id: number,
  command: ToggleBusinessRuleStatusCommand,
): Promise<boolean> => {
  const response = await apiClient.patch<ApiResponse<boolean> | boolean>(
    `/BusinessRules/${id}/status`,
    command,
  );

  if (typeof response === "boolean") {
    return response;
  }

  return !!(response as ApiResponse<boolean>).value;
};

export const deleteBusinessRule = async (id: number): Promise<boolean> => {
  const response = await apiClient.delete<ApiResponse<boolean> | boolean>(`/BusinessRules/${id}`);

  if (typeof response === "boolean") {
    return response;
  }

  return !!(response as ApiResponse<boolean>).value;
};
