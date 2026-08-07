import { server } from '@repo/api-sdk/testing/msw-server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { clearCart, initCartFromStorage, resetCartState, useCart, useCartStore } from '@/app/[locale]/(shop)/_lib/hooks/useCart';

// p-1-0-0 (stock 14) / p-1-0-2 (stock 4) — real seeded SKUs from `packages/api-sdk/src/mocks/catalog-fixtures.ts`.
const SKU_HIGH_STOCK = 'p-1-0-0';
const SKU_LOW_STOCK = 'p-1-0-2';

function renderCart() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return renderHook(() => useCart(), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  });
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  localStorage.clear();
  resetCartState();
  clearCart();
});

describe('useCart (FE-INT — add/update/delete/rollback, issue #13)', () => {
  it('adds a SKU to an empty cart and resolves its live price/stock for display', async () => {
    const { result } = renderCart();

    act(() => {
      result.current.addToCart(SKU_HIGH_STOCK, 2, 14);
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
    });
    expect(result.current.items[0]).toMatchObject({ skuId: SKU_HIGH_STOCK, quantity: 2, price: 1_200_000, stock: 14 });
    expect(result.current.itemCount).toBe(2);
  });

  it('sums quantity when adding the same SKU twice, within stock', async () => {
    const { result } = renderCart();

    act(() => {
      result.current.addToCart(SKU_HIGH_STOCK, 2, 14);
    });
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => {
      result.current.addToCart(SKU_HIGH_STOCK, 3, 14);
    });
    await waitFor(() => expect(result.current.items[0]?.quantity).toBe(5));
  });

  it('updates a line quantity, clamped to its live stock', async () => {
    const { result } = renderCart();
    act(() => {
      result.current.addToCart(SKU_LOW_STOCK, 1, 4);
    });
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => {
      result.current.updateQuantity(SKU_LOW_STOCK, 4);
    });
    await waitFor(() => expect(result.current.items[0]?.quantity).toBe(4));

    // Requesting more than the live stock clamps rather than silently accepting the bad value.
    act(() => {
      result.current.updateQuantity(SKU_LOW_STOCK, 999);
    });
    await waitFor(() => expect(result.current.items[0]?.quantity).toBe(4));
  });

  it('removes a line', async () => {
    const { result } = renderCart();
    act(() => {
      result.current.addToCart(SKU_HIGH_STOCK, 1, 14);
    });
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => {
      result.current.removeCartItem(SKU_HIGH_STOCK);
    });
    await waitFor(() => expect(result.current.items).toHaveLength(0));
  });

  it('clears the whole cart', async () => {
    const { result } = renderCart();
    act(() => {
      result.current.addToCart(SKU_HIGH_STOCK, 1, 14);
      result.current.addToCart(SKU_LOW_STOCK, 1, 4);
    });
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    act(() => {
      result.current.clearCart();
    });
    await waitFor(() => expect(result.current.items).toHaveLength(0));
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('rolls back (refuses) adding a SKU already at its stock limit in the cart, instead of silently over-adding', async () => {
    const { result } = renderCart();
    act(() => {
      result.current.addToCart(SKU_LOW_STOCK, 4, 4); // fills the low-stock SKU to its limit
    });
    await waitFor(() => expect(result.current.items[0]?.quantity).toBe(4));

    let addResult: { ok: boolean; addedQuantity: number } | undefined;
    act(() => {
      addResult = result.current.addToCart(SKU_LOW_STOCK, 2, 4);
    });

    expect(addResult).toEqual({ ok: false, addedQuantity: 0 });
    expect(result.current.items[0]?.quantity).toBe(4); // unchanged — no silent partial/over-add
  });

  it('clamps a partial add to the remaining room instead of refusing outright', async () => {
    const { result } = renderCart();
    act(() => {
      result.current.addToCart(SKU_LOW_STOCK, 2, 4); // 2 left of 4 stock
    });
    await waitFor(() => expect(result.current.items[0]?.quantity).toBe(2));

    let addResult: { ok: boolean; addedQuantity: number } | undefined;
    act(() => {
      addResult = result.current.addToCart(SKU_LOW_STOCK, 5, 4); // asks for 5 more, only 2 room left
    });

    expect(addResult).toEqual({ ok: true, addedQuantity: 2 });
    await waitFor(() => expect(result.current.items[0]?.quantity).toBe(4));
  });

  it('persists to localStorage and can be re-read on a fresh load', async () => {
    const { result } = renderCart();
    act(() => {
      result.current.addToCart(SKU_HIGH_STOCK, 3, 14);
    });
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    resetCartState(); // simulate the in-memory store being gone (fresh page load)
    expect(useCartStore.getState().items).toEqual([]);

    initCartFromStorage(); // what the hook's mount effect calls
    expect(useCartStore.getState().items).toEqual([{ skuId: SKU_HIGH_STOCK, quantity: 3 }]);
  });
});
