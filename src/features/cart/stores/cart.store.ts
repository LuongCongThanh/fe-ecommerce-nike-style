'use client';

import { create } from 'zustand';

import { createPersistedListStore } from '@/shared/lib/hooks/createPersistedListStore';

export interface CartItem {
  skuId: string;
  quantity: number;
}

// v2: {skuId, quantity} — v1's {variantId, price, ...} shape is dropped, not migrated.
export const cartPersistence = createPersistedListStore<CartItem>('cart-storage-v2', 2);

interface CartState {
  items: CartItem[];
  /** Flips true once `initCartFromStorage()` has actually run — lets a mount-time "is the cart empty?"
   * check (issue #16 — Checkout) tell "genuinely empty" apart from "hasn't read localStorage yet". */
  isHydrated: boolean;
  addItem: (skuId: string, quantity: number) => void;
  setQuantity: (skuId: string, quantity: number) => void;
  removeItem: (skuId: string) => void;
  clearCart: () => void;
  replaceItems: (items: CartItem[]) => void;
}

// Khởi tạo rỗng (không đọc localStorage ở module scope) để khớp SSR — dữ liệu thật được nạp qua
// initCartFromStorage() trong useEffect (client-only, sau lần render đầu tiên). Xem ADR-0006.
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isHydrated: false,
  addItem: (skuId, quantity) => {
    const existing = get().items.find((i) => i.skuId === skuId);
    const items =
      existing === undefined
        ? [...get().items, { skuId, quantity }]
        : get().items.map((i) => (i.skuId === skuId ? { ...i, quantity: i.quantity + quantity } : i));
    set({ items });
    cartPersistence.write(items);
  },
  setQuantity: (skuId, quantity) => {
    const items = quantity <= 0 ? get().items.filter((i) => i.skuId !== skuId) : get().items.map((i) => (i.skuId === skuId ? { ...i, quantity } : i));
    set({ items });
    cartPersistence.write(items);
  },
  removeItem: (skuId) => {
    const items = get().items.filter((i) => i.skuId !== skuId);
    set({ items });
    cartPersistence.write(items);
  },
  clearCart: () => {
    set({ items: [] });
    cartPersistence.write([]);
  },
  replaceItems: (items) => {
    set({ items });
    cartPersistence.write(items);
  },
}));

export function resetCartState(): void {
  useCartStore.setState({ items: [], isHydrated: false });
}

export function initCartFromStorage(): void {
  useCartStore.setState({ items: cartPersistence.read(), isHydrated: true });
}

export function clearCart(): void {
  useCartStore.getState().clearCart();
}

export function getCartItems(): CartItem[] {
  return useCartStore.getState().items;
}

export function replaceCartItems(items: CartItem[]): void {
  useCartStore.getState().replaceItems(items);
}
