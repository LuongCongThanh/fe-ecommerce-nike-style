import { getSkusByIds } from '@repo/api-sdk/endpoints/cart';
import { registerAuthRuntimeAdapter } from '@repo/api-sdk/client/runtime';
import { encodeAccessToken } from '@repo/api-sdk/mocks/auth-fixtures';
import { resetMockCatalogStockForTesting } from '@repo/api-sdk/mocks/catalog-fixtures';
import { resetMockOrderDbForTesting } from '@repo/api-sdk/mocks/order-fixtures';
import { resetMockReservationsForTesting } from '@repo/api-sdk/mocks/reservation-fixtures';
import { server } from '@repo/api-sdk/testing/msw-server';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { checkoutActions } from '@/app/[locale]/(shop)/_lib/api/checkout';
import { orderActions } from '@/app/[locale]/(shop)/_lib/api/order';
import { ApiError } from '@/shared/lib/errors/api-error';

// Real seeded SKUs from `packages/api-sdk/src/mocks/catalog-fixtures.ts`.
const SKU_HIGH_STOCK = 'p-1-0-0'; // stock 14
const SKU_LOW_STOCK = 'p-1-0-2'; // stock 4
const ACCOUNT_USER_ID = 1;

const ADDRESS = { fullName: 'Nguyễn Văn A', phoneNumber: '0912345678', address: '123 ABC', city: 'Hà Nội', district: 'Q1', ward: 'P1' } as const;

let unregister: (() => void) | undefined;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  unregister?.();
  vi.useRealTimers();
});
afterAll(() => server.close());

beforeEach(() => {
  resetMockReservationsForTesting();
  resetMockOrderDbForTesting();
  resetMockCatalogStockForTesting();
  unregister = registerAuthRuntimeAdapter({
    getAccessToken: () => encodeAccessToken({ sub: ACCOUNT_USER_ID, exp: Date.now() + 60_000 }),
    refreshSession: () => Promise.reject(new Error('not used in this test')),
  });
});

describe('Reservation (FE-INT, issue #16)', () => {
  it('reserves stock and reduces what other requests see as available', async () => {
    const reservation = await checkoutActions.reserve([{ skuId: SKU_LOW_STOCK, quantity: 3 }]);
    expect(reservation.reservationId).toBeTruthy();

    const [resolved] = await getSkusByIds([SKU_LOW_STOCK]);
    expect(resolved?.stock).toBe(1); // 4 base - 3 reserved
  });

  it('refuses a reservation that exceeds available stock', async () => {
    await expect(checkoutActions.reserve([{ skuId: SKU_LOW_STOCK, quantity: 999 }])).rejects.toMatchObject({ status: 409 });
  });

  it('releases stock once the reservation expires, without an explicit release call', async () => {
    vi.useFakeTimers();
    const reservation = await checkoutActions.reserve([{ skuId: SKU_LOW_STOCK, quantity: 4 }]);
    expect(reservation.reservationId).toBeTruthy();

    vi.advanceTimersByTime(11_000); // > RESERVATION_TTL_MS (10s)

    const [resolved] = await getSkusByIds([SKU_LOW_STOCK]);
    expect(resolved?.stock).toBe(4); // fully available again
  });
});

describe('Place Order — commit + snapshot (FE-INT, issue #16)', () => {
  it('commits the Reservation permanently on success and snapshots the OrderItem', async () => {
    const reservation = await checkoutActions.reserve([{ skuId: SKU_HIGH_STOCK, quantity: 2 }]);

    const order = await orderActions.create({
      ...ADDRESS,
      shippingMethod: 'standard',
      paymentMethod: 'cod',
      items: [{ variantId: SKU_HIGH_STOCK, quantity: 2 }],
      reservationId: reservation.reservationId,
      requestKey: 'req-1',
    });

    expect(order.status).toBe('PENDING');
    expect(order.items[0]).toMatchObject({ product_name: 'Running Shoe Alpha', quantity: 2 });

    // Reservation consumed -> stock permanently committed, not just held.
    const [resolved] = await getSkusByIds([SKU_HIGH_STOCK]);
    expect(resolved?.stock).toBe(12); // 14 - 2, and staying down (not released back)
  });

  it('rejects Place Order against an expired Reservation', async () => {
    vi.useFakeTimers();
    const reservation = await checkoutActions.reserve([{ skuId: SKU_HIGH_STOCK, quantity: 1 }]);
    vi.advanceTimersByTime(11_000);

    await expect(
      orderActions.create({
        ...ADDRESS,
        shippingMethod: 'standard',
        paymentMethod: 'cod',
        items: [{ variantId: SKU_HIGH_STOCK, quantity: 1 }],
        reservationId: reservation.reservationId,
        requestKey: 'req-2',
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('is idempotent: retrying the same requestKey replays the original order instead of creating a duplicate', async () => {
    const reservation = await checkoutActions.reserve([{ skuId: SKU_HIGH_STOCK, quantity: 1 }]);
    const payload = {
      ...ADDRESS,
      shippingMethod: 'standard' as const,
      paymentMethod: 'cod' as const,
      items: [{ variantId: SKU_HIGH_STOCK, quantity: 1 }],
      reservationId: reservation.reservationId,
      requestKey: 'req-idempotent',
    };

    const first = await orderActions.create(payload);
    const second = await orderActions.create(payload);

    expect(second.id).toBe(first.id);

    const orders = await orderActions.list();
    expect(orders.filter((o) => o.id === first.id)).toHaveLength(1);

    // Stock committed only once, not twice, despite two requests.
    const [resolved] = await getSkusByIds([SKU_HIGH_STOCK]);
    expect(resolved?.stock).toBe(13); // 14 - 1
  });

  it('rejects Place Order for a signed-out request', async () => {
    unregister?.();
    unregister = undefined;

    await expect(
      orderActions.create({
        ...ADDRESS,
        shippingMethod: 'standard',
        paymentMethod: 'cod',
        items: [{ variantId: SKU_HIGH_STOCK, quantity: 1 }],
        reservationId: 'whatever',
        requestKey: 'req-3',
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
