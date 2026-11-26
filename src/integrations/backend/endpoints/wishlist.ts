import { apiClient } from '@/integrations/backend/client/fetcher';
import { API_BASE_URL } from '@/integrations/backend/env/config';
import type { Product } from '@/integrations/backend/schemas/catalog/catalog.schema';
import type { WishlistItem } from '@/integrations/backend/schemas/wishlist/wishlist.schema';

const WISHLIST_API = {
  PRODUCTS: `${API_BASE_URL}/api/wishlist/products`,
  MERGE: `${API_BASE_URL}/api/wishlist/merge`,
} as const;

/** Resolves live Product data for a set of wishlist productIds — WishlistItem never caches display fields (mirrors Cart's `getSkusByIds`). */
export async function getProductsByIds(productIds: string[]): Promise<Product[]> {
  if (productIds.length === 0) return [];
  const data = await apiClient.get<{ data: Product[] }>(WISHLIST_API.PRODUCTS, { ids: productIds.join(',') });
  return data.data;
}

/** Merges the guest wishlist into the signed-in account's wishlist — union by Product, dedupe, no quantity concept (glossary.md — Merge Wishlist). */
export async function mergeWishlistAfterLogin(items: WishlistItem[]): Promise<Product[]> {
  const data = await apiClient.post<{ data: Product[] }>(WISHLIST_API.MERGE, { items });
  return data.data;
}
