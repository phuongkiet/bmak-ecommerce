import { apiClient, ApiResponse } from "./apiClient";
import type { FavoriteProductDto } from "@/models/Favorite";

export interface AddFavoriteCommand {
	productId: number;
}

type FavoritesResult = ApiResponse<FavoriteProductDto[]> | FavoriteProductDto[];
type FavoriteActionResult = ApiResponse<boolean> | boolean;

const FAVORITES_ENDPOINT = "/Favorites";

const normalizeFavorites = (response: FavoritesResult): FavoriteProductDto[] => {
	if (Array.isArray(response)) return response;
	return response.value || [];
};

const normalizeActionResult = (response: FavoriteActionResult): boolean => {
	if (typeof response === "boolean") return response;
	return response.value ?? false;
};

export const getFavorites = async (): Promise<FavoriteProductDto[]> => {
	const response = await apiClient.get<FavoritesResult>(FAVORITES_ENDPOINT);
	return normalizeFavorites(response);
};

export const addFavorite = async (
	command: AddFavoriteCommand,
): Promise<boolean> => {
	const response = await apiClient.post<FavoriteActionResult>(
		FAVORITES_ENDPOINT,
		command,
	);
	return normalizeActionResult(response);
};

export const removeFavorite = async (productId: number): Promise<boolean> => {
	const response = await apiClient.delete<FavoriteActionResult>(
		`${FAVORITES_ENDPOINT}/${productId}`,
	);
	return normalizeActionResult(response);
};

