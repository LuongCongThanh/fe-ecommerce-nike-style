'use client';

import { useEffect } from 'react';

import { getProductsByIds, mergeWishlistAfterLogin } from '@repo/api-sdk/endpoints/wishlist';
import type { Product } from '@repo/schemas/catalog';
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';

import { ensureApiMockingReady } from '@/shared/lib/api-mocking';

/** A Wishlist line references a Product only — no SKU/Variant, no quantity (glossary.md — WishlistItem). */
export interface WishlistItem {
  productId: string;
}

const WISHLIST_STORAGE_KEY = 'wishlist-storage-v1';
const WISHLIST_STORAGE_VERSION = 1;

interface PersistedWishlistV1 {
  version: 1;
  items: WishlistItem[];
}

function readPersistedWishlist(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw) as PersistedWishlistV1;
    return parsed.items;
  } catch {
    return [];
  }
}

function persistWishlist(items: WishlistItem[]): void {
  const persisted: PersistedWishlistV1 = { version: WISHLIST_STORAGE_VERSION, items };
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(persisted));
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  replaceItems: (items: WishlistItem[]) => void;
}

// Khởi tạo rỗng (không đọc localStorage ở module scope) để khớp SSR — giống useCart.ts (ADR-0006).
export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  addItem: (productId) => {
    if (get().items.some((i) => i.productId === productId)) return;
    const items = [...get().items, { productId }];
    set({ items });
    persistWishlist(items);
  },
  removeItem: (productId) => {
    const items = get().items.filter((i) => i.productId !== productId);
    set({ items });
    persistWishlist(items);
  },
  replaceItems: (items) => {
    set({ items });
    persistWishlist(items);
  },
}));

export function resetWishlistState(): void {
  useWishlistStore.setState({ items: [] });
}

export function initWishlistFromStorage(): void {
  useWishlistStore.setState({ items: readPersistedWishlist() });
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

let hasHydrated = false;

function useHydrateWishlist(): void {
  useEffect(() => {
    if (!hasHydrated) {
      hasHydrated = true;
      initWishlistFromStorage();
    }
  }, []);
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
