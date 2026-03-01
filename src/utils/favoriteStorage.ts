const FAVORITE_PRODUCT_IDS_KEY = "favorite_product_ids";

const parseIds = (raw: string | null): number[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && item > 0);
  } catch {
    return [];
  }
};

const saveIds = (ids: number[]) => {
  localStorage.setItem(FAVORITE_PRODUCT_IDS_KEY, JSON.stringify(ids));
};

export const getFavoriteProductIds = (): number[] => {
  return parseIds(localStorage.getItem(FAVORITE_PRODUCT_IDS_KEY));
};

export const isProductFavorite = (productId: number): boolean => {
  if (!Number.isInteger(productId) || productId <= 0) return false;
  return getFavoriteProductIds().includes(productId);
};

export const addProductToFavorite = (productId: number): number[] => {
  if (!Number.isInteger(productId) || productId <= 0) {
    return getFavoriteProductIds();
  }

  const current = getFavoriteProductIds().filter((id) => id !== productId);
  const next = [productId, ...current];
  saveIds(next);
  return next;
};

export const removeProductFromFavorite = (productId: number): number[] => {
  if (!Number.isInteger(productId) || productId <= 0) {
    return getFavoriteProductIds();
  }

  const next = getFavoriteProductIds().filter((id) => id !== productId);
  saveIds(next);
  return next;
};
