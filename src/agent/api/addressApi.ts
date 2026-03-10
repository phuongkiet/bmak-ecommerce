import { ApiResponse, apiClient } from "./apiClient";
import type { AddressDto, CreateAddressRequest, UpdateAddressRequest } from "@/models/Address";

type AddressListResult = ApiResponse<AddressDto[]> | AddressDto[];
type AddressDetailResult = ApiResponse<AddressDto> | AddressDto;
type AddressCreateResult = ApiResponse<number> | number;
type AddressActionResult = ApiResponse<boolean> | boolean;

const ADDRESS_ENDPOINT = "/Addresses";

const normalizeAddressList = (response: AddressListResult): AddressDto[] => {
	if (Array.isArray(response)) return response;
	return response.value || [];
};

const normalizeAddressDetail = (response: AddressDetailResult): AddressDto | null => {
	if (response && typeof response === "object" && "id" in response) {
		return response as AddressDto;
	}

	if (response && typeof response === "object" && "value" in response) {
		return response.value || null;
	}

	return null;
};

const normalizeCreateResult = (response: AddressCreateResult): number => {
	if (typeof response === "number") return response;
	return response.value ?? 0;
};

const normalizeActionResult = (response: AddressActionResult): boolean => {
	if (typeof response === "boolean") return response;
	return response.value ?? false;
};

export const getMyAddresses = async (): Promise<AddressDto[]> => {
	const response = await apiClient.get<AddressListResult>(ADDRESS_ENDPOINT);
	return normalizeAddressList(response);
};

export const getAddressById = async (id: number): Promise<AddressDto | null> => {
	const response = await apiClient.get<AddressDetailResult>(`${ADDRESS_ENDPOINT}/${id}`);
	return normalizeAddressDetail(response);
};

export const createAddress = async (command: CreateAddressRequest): Promise<number> => {
	const response = await apiClient.post<AddressCreateResult>(ADDRESS_ENDPOINT, command);
	return normalizeCreateResult(response);
};

export const updateAddress = async (id: number, command: UpdateAddressRequest): Promise<boolean> => {
	const response = await apiClient.put<AddressActionResult>(`${ADDRESS_ENDPOINT}/${id}`, command);
	return normalizeActionResult(response);
};

export const deleteAddress = async (id: number): Promise<boolean> => {
	const response = await apiClient.delete<AddressActionResult>(`${ADDRESS_ENDPOINT}/${id}`);
	return normalizeActionResult(response);
};

const addressApi = {
	getMyAddresses,
	getAddressById,
	createAddress,
	updateAddress,
	deleteAddress,
};

export default addressApi;
