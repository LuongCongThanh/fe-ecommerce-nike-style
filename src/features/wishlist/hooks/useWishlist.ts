'use client';

import { useQuery } from '@tanstack/react-query';

import {
  getWishlistItems,
  initWishlistFromStorage,
  replaceWishlistItems,
  useWishlistStore,
  wishlistPersistence,
} from '@/features/wishlist/stores/wishlist.store';
import { getProductsByIds, mergeWishlistAfterLogin } from '@/lib/api/endpoints/wishlist';
import type { Product } from '@/lib/schemas/catalog/catalog';
import { ensureApiMockingReady } from '@/shared/lib/api-mocking';

/** Merges the guest wishlist into the account's wishlist after login/register — union+dedupe by Product (glossary.md — Merge Wishlist). */
export async function mergeWishlistOnLogin(): Promise<void> {
  const guestItems = getWishlistItems();
  await ensureApiMockingReady();
  const mergedProducts = await mergeWishlistAfterLogin(guestItems.map((i) => ({ productId: i.productId })));
  replaceWishlistItems(mergedProducts.map((p) => ({ productId: p.id })));
}

function useHydrateWishlist(): void {
  wishlistPersistence.useHydrateOnce(initWishlistFromStorage);
}

/**
 * Lightweight toggle for a single Product — used by `ProductCard`'s heart button on the PLP. Reads only
 * the raw guest/merged item list (no network resolve), so rendering many cards doesn't trigger many
 * redundant fetches — mirrors `useAuth`'s narrower `useIsLoggedIn` split off the heavier `useAuth`.
 */
export function useIsWishlisted(productId: string) {
  useHydrateWishlist();

  const isWishlisted = useWishlistStore((s) => s.items.some((i) => i.productId === productId));
  const addItem = useWishlistStore((s) => s.addItem);
  const removeItem = useWishlistStore((s) => s.removeItem);

  const toggle = (): void => {
    if (isWishlisted) {
      removeItem(productId);
    } else {
      addItem(productId);
    }
  };

  return { isWishlisted, toggle };
}

const wishlistKeys = {
  products: (productIds: string[]) => ['wishlist', 'products', productIds] as const,
};

/**
 * Full wishlist hook — `products` are live-resolved Products (name/image/price always fresh, never
 * cached), for the Wishlist listing page. See `useIsWishlisted` for the cheap per-card toggle.
 */
export function useWishlist() {
  useHydrateWishlist();

  const rawItems = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);

  const productIds = rawItems.map((i) => i.productId);
  const {
    data: resolvedProducts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: wishlistKeys.products(productIds),
    enabled: productIds.length > 0,
    queryFn: async () => {
      await ensureApiMockingReady();
      return getProductsByIds(productIds);
    },
  });

  const products: Product[] = rawItems.flatMap((item) => {
    const product = resolvedProducts?.find((p) => p.id === item.productId);
    return product === undefined ? [] : [product];
  });

  return {
    items: rawItems,
    products,
    isLoading: rawItems.length > 0 && isLoading,
    isError,
    removeFromWishlist: removeItem,
    itemCount: rawItems.length,
  };
}
