'use client';

import { create } from 'zustand';

import { createPersistedListStore } from '@/shared/lib/hooks/createPersistedListStore';

export interface WishlistItem {
  productId: string;
}

export const wishlistPersistence = createPersistedListStore<WishlistItem>('wishlist-storage-v1', 1);

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
    wishlistPersistence.write(items);
  },
  removeItem: (productId) => {
    const items = get().items.filter((i) => i.productId !== productId);
    set({ items });
    wishlistPersistence.write(items);
  },
  replaceItems: (items) => {
    set({ items });
    wishlistPersistence.write(items);
  },
}));

export function resetWishlistState(): void {
  useWishlistStore.setState({ items: [] });
}

export function initWishlistFromStorage(): void {
  useWishlistStore.setState({ items: wishlistPersistence.read() });
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
