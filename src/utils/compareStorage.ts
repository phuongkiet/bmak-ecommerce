const COMPARE_PRODUCT_IDS_KEY = "compare_product_ids";
const MAX_COMPARE_ITEMS = 3;

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
  localStorage.setItem(COMPARE_PRODUCT_IDS_KEY, JSON.stringify(ids));
};

export const getComparedProductIds = (): number[] => {
  return parseIds(localStorage.getItem(COMPARE_PRODUCT_IDS_KEY));
};

export const isProductCompared = (productId: number): boolean => {
  if (!Number.isInteger(productId) || productId <= 0) return false;
  return getComparedProductIds().includes(productId);
};

export const addProductToCompare = (productId: number): number[] => {
  if (!Number.isInteger(productId) || productId <= 0) {
    return getComparedProductIds();
  }

  const current = getComparedProductIds().filter((id) => id !== productId);
  const next = [productId, ...current].slice(0, MAX_COMPARE_ITEMS);
  saveIds(next);
  return next;
};

export const removeProductFromCompare = (productId: number): number[] => {
  if (!Number.isInteger(productId) || productId <= 0) {
    return getComparedProductIds();
  }

  const next = getComparedProductIds().filter((id) => id !== productId);
  saveIds(next);
  return next;
};

export const clearCompareStorage = (): void => {
  localStorage.removeItem(COMPARE_PRODUCT_IDS_KEY);
};
