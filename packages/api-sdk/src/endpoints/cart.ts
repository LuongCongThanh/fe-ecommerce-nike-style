import { apiClient } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

const CART_API = {
  SKUS: `${API_BASE_URL}/api/catalog/skus`,
  MERGE: `${API_BASE_URL}/api/cart/merge`,
} as const;

export interface ResolvedCartLine {
  skuId: string;
  price: number;
  stock: number;
  color: string | null;
  size: string | null;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
}

export interface ResolvedCartLineWithQuantity extends ResolvedCartLine {
  quantity: number;
}

export interface CartItemPayload {
  skuId: string;
  quantity: number;
}

/** Resolves live price/stock/display data for a set of SKU ids — CartItem never caches this (glossary.md). */
export async function getSkusByIds(skuIds: string[]): Promise<ResolvedCartLine[]> {
  if (skuIds.length === 0) return [];
  const data = await apiClient.get<{ data: ResolvedCartLine[] }>(CART_API.SKUS, { ids: skuIds.join(',') });
  return data.data;
}

/** Merges the guest cart into the signed-in account's cart (Decision #36) — sum by SKU, then clamp to `available`. */
export async function mergeCartAfterLogin(items: CartItemPayload[]): Promise<ResolvedCartLineWithQuantity[]> {
  const data = await apiClient.post<{ data: ResolvedCartLineWithQuantity[] }>(CART_API.MERGE, { items });
  return data.data;
}
