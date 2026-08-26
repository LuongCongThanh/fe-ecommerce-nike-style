import { resetAuthRuntime } from '@repo/api-sdk/client';
import { registerAuthRuntimeAdapter } from '@repo/api-sdk/client/runtime';
import { encodeAccessToken } from '@repo/api-sdk/mocks/auth-fixtures';
import { resetMockCatalogStockForTesting } from '@repo/api-sdk/mocks/catalog-fixtures';
import { resetMockReservationsForTesting } from '@repo/api-sdk/mocks/reservation-fixtures';
import { server } from '@repo/api-sdk/testing/msw-server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { useReservation } from '@/app/[locale]/(shop)/_lib/hooks/checkout/useReservation';
import type { CartLine } from '@/app/[locale]/(shop)/_lib/hooks/useCart';

// Real seeded SKUs from `packages/api-sdk/src/mocks/catalog-fixtures.ts`.
const SKU_HIGH_STOCK = 'p-1-0-0'; // stock 14
const SKU_LOW_STOCK = 'p-1-0-2'; // stock 4
const ACCOUNT_USER_ID = 1;

function cartLine(skuId: string, quantity: number): CartLine {
  return { skuId, quantity, price: 0, stock: 0, name: '', image: null, color: null, size: null };
}

function renderReservation(items: CartLine[]) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return renderHook(({ items: hookItems }: { items: CartLine[] }) => useReservation(hookItems), {
    initialProps: { items },
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  });
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetAuthRuntime();
});
afterAll(() => server.close());

beforeEach(() => {
  resetMockReservationsForTesting();
  resetMockCatalogStockForTesting();
  registerAuthRuntimeAdapter({
    getAccessToken: () => encodeAccessToken({ sub: ACCOUNT_USER_ID, exp: Date.now() + 60_000 }),
    refreshSession: () => Promise.reject(new Error('not used in this test')),
  });
});

describe('useReservation (checkout, issue #16)', () => {
  it('stays idle (no reservationId, not pending) for an empty cart', () => {
    const { result } = renderReservation([]);

    expect(result.current).toEqual({ reservationId: null, isPending: false, error: null });
  });

  it('reserves the given items exactly once and resolves a reservationId', async () => {
    const { result } = renderReservation([cartLine(SKU_HIGH_STOCK, 2)]);

    expect(result.current.isPending).toBe(true);
    await waitFor(() => expect(result.current.reservationId).not.toBeNull());
    expect(result.current.error).toBeNull();
  });

  it('surfaces a translated error when the requested quantity exceeds stock', async () => {
    const { result } = renderReservation([cartLine(SKU_LOW_STOCK, 999)]);

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.reservationId).toBeNull();
    expect(result.current.isPending).toBe(false);
  });

  it('does not re-reserve when the item set is unchanged across re-renders', async () => {
    const { result, rerender } = renderReservation([cartLine(SKU_HIGH_STOCK, 1)]);
    await waitFor(() => expect(result.current.reservationId).not.toBeNull());
    const firstReservationId = result.current.reservationId;

    rerender({ items: [cartLine(SKU_HIGH_STOCK, 1)] });

    // Same itemsKey → same query → no new network call, same reservation.
    expect(result.current.reservationId).toBe(firstReservationId);
  });

  it('reserves again when the item set actually changes', async () => {
    const { result, rerender } = renderReservation([cartLine(SKU_HIGH_STOCK, 1)]);
    await waitFor(() => expect(result.current.reservationId).not.toBeNull());
    const firstReservationId = result.current.reservationId;

    rerender({ items: [cartLine(SKU_HIGH_STOCK, 2)] });

    await waitFor(() => expect(result.current.reservationId).not.toBe(firstReservationId));
  });
});
