'use client';

import { useQuery } from '@tanstack/react-query';

import type { CartItem } from '@/features/cart/stores/cart.store';
import { cartPersistence, getCartItems, initCartFromStorage, replaceCartItems, useCartStore } from '@/features/cart/stores/cart.store';
import { getSkusByIds, mergeCartAfterLogin } from '@/lib/api/endpoints/cart';
import { ensureApiMockingReady } from '@/shared/lib/api-mocking';
import { notify } from '@/shared/lib/notification';

export type { CartItem } from '@/features/cart/stores/cart.store';
export { clearCart, getCartItems, initCartFromStorage, replaceCartItems, resetCartState, useCartStore } from '@/features/cart/stores/cart.store';

/** Live-resolved line for display/totals — price/stock are never cached, always read from the SKU (glossary.md). */
export interface CartLine extends CartItem {
  price: number;
  stock: number;
  name: string;
  image: string | null;
  color: string | null;
  size: string | null;
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

/**
 * Public cart hook — `items` are always live-resolved `CartLine`s (price/stock/name/image read fresh
 * from the SKU, never cached), so "always read từ SKU tại thời điểm truy vấn" holds by construction.
 */
export function useCart() {
  cartPersistence.useHydrateOnce(initCartFromStorage);

  const rawItems = useCartStore((s) => s.items);
  const isHydrated = useCartStore((s) => s.isHydrated);
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

  /** Removes `skuId` and toasts an "Hoàn tác" (undo) action that re-adds it — the one place both the
   * drawer and the full cart table's remove button get this behavior, instead of each hand-rolling the
   * same `notify.success(..., { action: { onClick: () => useCartStore.getState().addItem(...) } })`. */
  const removeCartItemWithUndo = (skuId: string): void => {
    const removed = items.find((i) => i.skuId === skuId);
    removeItem(skuId);
    if (removed === undefined) return;

    notify.success('Đã xóa sản phẩm khỏi giỏ hàng', {
      description: removed.name,
      action: {
        label: 'Hoàn tác',
        onClick: () => {
          addItem(removed.skuId, removed.quantity);
        },
      },
    });
  };

  return {
    items,
    isLoading,
    isError,
    isHydrated,
    addToCart,
    updateQuantity,
    removeCartItem: removeItem,
    removeCartItemWithUndo,
    clearCart: clearCartAction,
    total,
    itemCount,
  };
}
