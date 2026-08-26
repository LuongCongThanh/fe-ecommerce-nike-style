'use client';

import { getProductsByIds, mergeWishlistAfterLogin } from '@repo/api-sdk/endpoints/wishlist';
import type { Product } from '@repo/schemas/catalog';
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';

import { ensureApiMockingReady } from '@/shared/lib/api-mocking';
import { createPersistedListStore } from '@/shared/lib/hooks/createPersistedListStore';

/** A Wishlist line references a Product only — no SKU/Variant, no quantity (glossary.md — WishlistItem). */
export interface WishlistItem {
  productId: string;
}

const wishlistStore = createPersistedListStore<WishlistItem>('wishlist-storage-v1', 1);

interface WishlistState {
  items: WishlistItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  replaceItems: (items: WishlistItem[]) => void;
}

// Khởi tạo rỗng (không đọc localStorage ở module scope) để khớp SSR — dữ liệu thật được nạp qua
// initWishlistFromStorage() trong useHydrateWishlist() (client-only, sau lần render đầu tiên).
// Xem ADR-0006; hydrate + versioned envelope giờ dùng chung `createPersistedListStore` với useCart.ts.
export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  addItem: (productId) => {
    if (get().items.some((i) => i.productId === productId)) return;
    const items = [...get().items, { productId }];
    set({ items });
    wishlistStore.write(items);
  },
  removeItem: (productId) => {
    const items = get().items.filter((i) => i.productId !== productId);
    set({ items });
    wishlistStore.write(items);
  },
  replaceItems: (items) => {
    set({ items });
    wishlistStore.write(items);
  },
}));

export function resetWishlistState(): void {
  useWishlistStore.setState({ items: [] });
}

export function initWishlistFromStorage(): void {
  useWishlistStore.setState({ items: wishlistStore.read() });
}

export function clearWishlist(): void {
  useWishlistStore.getState().replaceItems([]);
}

export function getWishlistItems(): WishlistItem[] {
  return useWishlistStore.getState().items;
}

export function replaceWishlistItems(items: WishlistItem[]): void {
  useWishlistStore.getState().replaceItems(items);
}

/** Merges the guest wishlist into the account's wishlist after login/register — union+dedupe by Product (glossary.md — Merge Wishlist). */
export async function mergeWishlistOnLogin(): Promise<void> {
  const guestItems = getWishlistItems();
  await ensureApiMockingReady();
  const mergedProducts = await mergeWishlistAfterLogin(guestItems.map((i) => ({ productId: i.productId })));
  replaceWishlistItems(mergedProducts.map((p) => ({ productId: p.id })));
}

function useHydrateWishlist(): void {
  wishlistStore.useHydrateOnce(initWishlistFromStorage);
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
