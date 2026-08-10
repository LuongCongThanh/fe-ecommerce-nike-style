import { resetAuthRuntime } from '@repo/api-sdk/client';
import { encodeAccessToken } from '@repo/api-sdk/mocks/auth-fixtures';
import { registerAuthRuntimeAdapter } from '@repo/api-sdk/client/runtime';
import { server } from '@repo/api-sdk/testing/msw-server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  clearWishlist,
  getWishlistItems,
  initWishlistFromStorage,
  mergeWishlistOnLogin,
  resetWishlistState,
  useIsWishlisted,
  useWishlist,
  useWishlistStore,
} from '@/app/[locale]/(shop)/_lib/hooks/useWishlist';

// Real seeded Products from `packages/api-sdk/src/mocks/catalog-fixtures.ts` — p-1 has a Variant, p-3 doesn't.
const PRODUCT_WITH_VARIANT = 'p-1';
const PRODUCT_NO_VARIANT = 'p-3';
// Demo account (user id 1) — `wishlist-fixtures.ts` seeds it with an empty wishlist.
const ACCOUNT_USER_ID = 1;

function renderWishlist() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return renderHook(() => useWishlist(), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  });
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  localStorage.clear();
  resetWishlistState();
  clearWishlist();
});

describe('useIsWishlisted (FE-INT — toggle on ProductCard, issue #14)', () => {
  it('starts un-wishlisted and toggles on', () => {
    const { result } = renderHook(() => useIsWishlisted(PRODUCT_WITH_VARIANT));
    expect(result.current.isWishlisted).toBe(false);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isWishlisted).toBe(true);
    expect(getWishlistItems()).toEqual([{ productId: PRODUCT_WITH_VARIANT }]);
  });

  it('toggles off a wishlisted product without touching others', () => {
    act(() => {
      useWishlistStore.getState().addItem(PRODUCT_WITH_VARIANT);
      useWishlistStore.getState().addItem(PRODUCT_NO_VARIANT);
    });

    const { result } = renderHook(() => useIsWishlisted(PRODUCT_WITH_VARIANT));
    act(() => {
      result.current.toggle();
    });

    expect(getWishlistItems()).toEqual([{ productId: PRODUCT_NO_VARIANT }]);
  });

  it('does not add the same Product twice', () => {
    const { result } = renderHook(() => useIsWishlisted(PRODUCT_WITH_VARIANT));
    act(() => {
      result.current.toggle(); // on
    });
    act(() => {
      useWishlistStore.getState().addItem(PRODUCT_WITH_VARIANT); // direct duplicate add attempt
    });
    expect(getWishlistItems()).toEqual([{ productId: PRODUCT_WITH_VARIANT }]);
  });

  it('persists to localStorage and can be re-read on a fresh load', () => {
    const { result } = renderHook(() => useIsWishlisted(PRODUCT_WITH_VARIANT));
    act(() => {
      result.current.toggle();
    });

    resetWishlistState(); // simulate the in-memory store being gone (fresh page load)
    expect(useWishlistStore.getState().items).toEqual([]);

    initWishlistFromStorage(); // what the public hooks' mount effect calls
    expect(useWishlistStore.getState().items).toEqual([{ productId: PRODUCT_WITH_VARIANT }]);
  });
});

describe('useWishlist (FE-INT — resolved listing, issue #14)', () => {
  it('resolves live Product data for the wishlisted ids', async () => {
    act(() => {
      useWishlistStore.getState().addItem(PRODUCT_NO_VARIANT);
    });

    const { result } = renderWishlist();
    await waitFor(() => expect(result.current.products).toHaveLength(1));
    expect(result.current.products[0]).toMatchObject({ id: PRODUCT_NO_VARIANT });
    expect(result.current.itemCount).toBe(1);
  });

  it('removes an item from the wishlist', async () => {
    act(() => {
      useWishlistStore.getState().addItem(PRODUCT_NO_VARIANT);
    });
    const { result } = renderWishlist();
    await waitFor(() => expect(result.current.products).toHaveLength(1));

    act(() => {
      result.current.removeFromWishlist(PRODUCT_NO_VARIANT);
    });
    await waitFor(() => expect(result.current.products).toHaveLength(0));
  });
});

describe('mergeWishlistOnLogin (FE-INT — union+dedupe by Product, issue #14)', () => {
  it('merges the guest wishlist into the account wishlist as a plain union, deduping by Product id', async () => {
    // Demo account (user id 1) starts with an empty wishlist (wishlist-fixtures.ts seed) — merge in two
    // guest items, one of which the mock "account" side doesn't have yet, proving the union actually ran.
    act(() => {
      useWishlistStore.getState().addItem(PRODUCT_WITH_VARIANT);
      useWishlistStore.getState().addItem(PRODUCT_NO_VARIANT);
    });

    registerAuthRuntimeAdapter({
      getAccessToken: () => encodeAccessToken({ sub: ACCOUNT_USER_ID, exp: Date.now() + 60_000 }),
      refreshSession: () => Promise.reject(new Error('not used in this test')),
    });

    try {
      await mergeWishlistOnLogin();
    } finally {
      resetAuthRuntime();
    }

    const merged = getWishlistItems();
    expect(merged).toHaveLength(2);
    expect(merged.map((i) => i.productId).sort()).toEqual([PRODUCT_NO_VARIANT, PRODUCT_WITH_VARIANT].sort());
  });

  it('rejects (leaves the guest wishlist untouched) when there is no valid session', async () => {
    act(() => {
      useWishlistStore.getState().addItem(PRODUCT_WITH_VARIANT);
    });

    await expect(mergeWishlistOnLogin()).rejects.toBeDefined();
    expect(getWishlistItems()).toEqual([{ productId: PRODUCT_WITH_VARIANT }]);
  });
});
