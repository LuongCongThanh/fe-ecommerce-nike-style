'use client';

import { useEffect } from 'react';

import { create } from 'zustand';

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variantName?: string;
}

const CART_STORAGE_KEY = 'cart-storage';
const CART_STORAGE_VERSION = 1;

interface PersistedCartV1 {
  version: 1;
  items: CartItem[];
}

function readPersistedCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw === null) return [];

    const parsed = JSON.parse(raw) as CartItem[] | PersistedCartV1;
    // Backward compat: trước khi có versioning, cart-storage lưu trực tiếp CartItem[]
    return Array.isArray(parsed) ? parsed : parsed.items;
  } catch {
    return [];
  }
}

function persistCart(items: CartItem[]): void {
  const persisted: PersistedCartV1 = { version: CART_STORAGE_VERSION, items };
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(persisted));
}

interface CartState {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeCartItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

// Khởi tạo rỗng (không đọc localStorage ở module scope) để khớp SSR — dữ liệu
// thật được nạp qua initCartFromStorage() trong useEffect (client-only, sau lần
// render đầu tiên), tránh hydration mismatch. Xem ADR-0006.
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addToCart: (item) => {
    const existing = get().items.find((i) => i.variantId === item.variantId);
    const items =
      existing === undefined
        ? [...get().items, item]
        : get().items.map((i) => (i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i));
    set({ items });
    persistCart(items);
  },
  removeCartItem: (variantId) => {
    const items = get().items.filter((i) => i.variantId !== variantId);
    set({ items });
    persistCart(items);
  },
  updateQuantity: (variantId, quantity) => {
    const items = get().items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i));
    set({ items });
    persistCart(items);
  },
  clearCart: () => {
    set({ items: [] });
    persistCart([]);
  },
}));

export function resetCartState(): void {
  useCartStore.setState({ items: [] });
}

export function initCartFromStorage(): void {
  useCartStore.setState({ items: readPersistedCart() });
}

export function clearCart(): void {
  useCartStore.getState().clearCart();
}

let hasHydrated = false;

export function useCart() {
  useEffect(() => {
    if (!hasHydrated) {
      hasHydrated = true;
      initCartFromStorage();
    }
  }, []);

  const items = useCartStore((s) => s.items);
  const addToCart = useCartStore((s) => s.addToCart);
  const removeCartItem = useCartStore((s) => s.removeCartItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCartAction = useCartStore((s) => s.clearCart);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return { items, addToCart, removeCartItem, updateQuantity, clearCart: clearCartAction, total, itemCount };
}
