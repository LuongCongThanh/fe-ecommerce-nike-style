'use client';

import { useEffect } from 'react';

import { getSkusByIds, mergeCartAfterLogin } from '@repo/api-sdk/endpoints/cart';
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';

import { ensureApiMockingReady } from '@/shared/lib/api-mocking';

/** A Cart line references a SKU directly — no productId/Color/Size stored separately (glossary.md). */
export interface CartItem {
  skuId: string;
  quantity: number;
}

/** Live-resolved line for display/totals — price/stock are never cached, always read from the SKU (glossary.md). */
export interface CartLine extends CartItem {
  price: number;
  stock: number;
  name: string;
  image: string | null;
  color: string | null;
  size: string | null;
}

const CART_STORAGE_KEY = 'cart-storage-v2'; // v2: {skuId, quantity} — v1's {variantId, price, ...} shape is dropped, not migrated
const CART_STORAGE_VERSION = 2;

interface PersistedCartV2 {
  version: 2;
  items: CartItem[];
}

function readPersistedCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw) as PersistedCartV2;
    return parsed.items;
  } catch {
    return [];
  }
}

function persistCart(items: CartItem[]): void {
  const persisted: PersistedCartV2 = { version: CART_STORAGE_VERSION, items };
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(persisted));
}

interface CartState {
  items: CartItem[];
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
  addItem: (skuId, quantity) => {
    const existing = get().items.find((i) => i.skuId === skuId);
    const items =
      existing === undefined
        ? [...get().items, { skuId, quantity }]
        : get().items.map((i) => (i.skuId === skuId ? { ...i, quantity: i.quantity + quantity } : i));
    set({ items });
    persistCart(items);
  },
  setQuantity: (skuId, quantity) => {
    const items = quantity <= 0 ? get().items.filter((i) => i.skuId !== skuId) : get().items.map((i) => (i.skuId === skuId ? { ...i, quantity } : i));
    set({ items });
    persistCart(items);
  },
  removeItem: (skuId) => {
    const items = get().items.filter((i) => i.skuId !== skuId);
    set({ items });
    persistCart(items);
  },
  clearCart: () => {
    set({ items: [] });
    persistCart([]);
  },
  replaceItems: (items) => {
    set({ items });
    persistCart(items);
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

export function getCartItems(): CartItem[] {
  return useCartStore.getState().items;
}

export function replaceCartItems(items: CartItem[]): void {
  useCartStore.getState().replaceItems(items);
}

/** Merges the guest cart into the account's cart after login/register (Decision #36) and replaces the local cart with the merged result. */
export async function mergeCartOnLogin(): Promise<void> {
  const guestItems = getCartItems();
  await ensureApiMockingReady();
  const mergedLines = await mergeCartAfterLogin(guestItems);
  replaceCartItems(mergedLines.map((l) => ({ skuId: l.skuId, quantity: l.quantity })));
}

const cartKeys = {
  lines: (skuIds: string[]) => ['cart', 'lines', skuIds] as const,
};

let hasHydrated = false;

/**
 * Public cart hook — `items` are always live-resolved `CartLine`s (price/stock/name/image read fresh
 * from the SKU, never cached), so "always read từ SKU tại thời điểm truy vấn" holds by construction.
 */
export function useCart() {
  useEffect(() => {
    if (!hasHydrated) {
      hasHydrated = true;
      initCartFromStorage();
    }
  }, []);

  const rawItems = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCartAction = useCartStore((s) => s.clearCart);

  const skuIds = rawItems.map((i) => i.skuId);
  const {
    data: resolvedSkus,
    isLoading,
    isError,
  } = useQuery({
    queryKey: cartKeys.lines(skuIds),
    enabled: skuIds.length > 0,
    queryFn: async () => {
      await ensureApiMockingReady();
      return getSkusByIds(skuIds);
    },
  });

  const items: CartLine[] = rawItems.flatMap((item) => {
    const sku = resolvedSkus?.find((s) => s.skuId === item.skuId);
    if (sku === undefined) return [];
    return [
      {
        skuId: item.skuId,
        quantity: item.quantity,
        price: sku.price,
        stock: sku.stock,
        name: sku.name,
        image: sku.image,
        color: sku.color,
        size: sku.size,
      },
    ];
  });

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = rawItems.reduce((s, i) => s + i.quantity, 0);

  /** Adds `quantity` of `skuId`, clamped to `availableStock` — refuses (rollback) instead of silently over-adding (issue #13). */
  const addToCart = (skuId: string, quantity: number, availableStock: number): { ok: boolean; addedQuantity: number } => {
    const alreadyInCart = rawItems.find((i) => i.skuId === skuId)?.quantity ?? 0;
    const room = availableStock - alreadyInCart;
    if (room <= 0) return { ok: false, addedQuantity: 0 };

    const addedQuantity = Math.min(quantity, room);
    addItem(skuId, addedQuantity);
    return { ok: true, addedQuantity };
  };

  /** Sets `skuId`'s quantity, clamped to its currently-resolved live stock. */
  const updateQuantity = (skuId: string, quantity: number): void => {
    const stock = resolvedSkus?.find((s) => s.skuId === skuId)?.stock ?? quantity;
    setQuantity(skuId, Math.min(quantity, stock));
  };

  return {
    items,
    isLoading,
    isError,
    addToCart,
    updateQuantity,
    removeCartItem: removeItem,
    clearCart: clearCartAction,
    total,
    itemCount,
  };
}
