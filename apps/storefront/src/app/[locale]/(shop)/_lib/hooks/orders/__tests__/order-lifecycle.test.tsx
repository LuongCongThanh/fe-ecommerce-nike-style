import { resetAuthRuntime } from '@repo/api-sdk/client';
import { registerAuthRuntimeAdapter } from '@repo/api-sdk/client/runtime';
import { encodeAccessToken } from '@repo/api-sdk/mocks/auth-fixtures';
import { resetMockOrderDbForTesting, setOrderStatusForTesting } from '@repo/api-sdk/mocks/order-fixtures';
import { server } from '@repo/api-sdk/testing/msw-server';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { orderActions } from '@/app/[locale]/(shop)/_lib/api/order';
import { ApiError } from '@/shared/lib/errors/api-error';

// Demo account (user id 1), order 1001 is DELIVERED, order 1002 is PENDING (order-fixtures.ts seed).
const ACCOUNT_USER_ID = 1;
const DELIVERED_ORDER_ID = '1001';
const PENDING_ORDER_ID = '1002';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetAuthRuntime();
});
afterAll(() => server.close());

beforeEach(() => {
  resetMockOrderDbForTesting();
  registerAuthRuntimeAdapter({
    getAccessToken: () => encodeAccessToken({ sub: ACCOUNT_USER_ID, exp: Date.now() + 60_000 }),
    refreshSession: () => Promise.reject(new Error('not used in this test')),
  });
});

describe('Cancel — valid/invalid transitions from the Customer view (FE-INT, issue #17)', () => {
  it('cancels a PENDING order', async () => {
    const order = await orderActions.cancel(PENDING_ORDER_ID);
    expect(order.status).toBe('CANCELLED');
  });

  it('cancels a PROCESSING order', async () => {
    setOrderStatusForTesting(1002, 'PROCESSING');
    const order = await orderActions.cancel(PENDING_ORDER_ID);
    expect(order.status).toBe('CANCELLED');
  });

  it.each(['PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'] as const)(
    'rejects cancelling a %s order',
    async (status) => {
      setOrderStatusForTesting(1002, status);
      await expect(orderActions.cancel(PENDING_ORDER_ID)).rejects.toMatchObject({ status: 409 });
    },
  );

  it('404s cancelling an order that does not exist / is not the Customer’s own', async () => {
    await expect(orderActions.cancel('999999')).rejects.toMatchObject({ status: 404 });
  });

  it('rejects for a signed-out request', async () => {
    resetAuthRuntime();
    await expect(orderActions.cancel(PENDING_ORDER_ID)).rejects.toBeInstanceOf(ApiError);
  });
});

describe('Return request — valid/invalid transitions from the Customer view (FE-INT, issue #17)', () => {
  it('requests a return for a DELIVERED order within the 7-day window', async () => {
    // The seed's `delivered_at` is a fixed calendar date, not relative to "now" — set a fresh one so
    // this test doesn't silently start failing as real time moves past its 7-day window.
    setOrderStatusForTesting(1001, 'DELIVERED', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    const order = await orderActions.requestReturn(DELIVERED_ORDER_ID);
    expect(order.status).toBe('RETURN_REQUESTED');
  });

  it('rejects a return request past the 7-day window', async () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    setOrderStatusForTesting(1001, 'DELIVERED', eightDaysAgo);
    await expect(orderActions.requestReturn(DELIVERED_ORDER_ID)).rejects.toMatchObject({ status: 409 });
  });

  it('accepts a return request right at the edge of the window (just under 7 days)', async () => {
    const justUnder7Days = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000 - 60_000)).toISOString();
    setOrderStatusForTesting(1001, 'DELIVERED', justUnder7Days);
    const order = await orderActions.requestReturn(DELIVERED_ORDER_ID);
    expect(order.status).toBe('RETURN_REQUESTED');
  });

  it.each(['PENDING', 'PROCESSING', 'PACKED', 'SHIPPED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'] as const)(
    'rejects a return request for a %s order',
    async (status) => {
      setOrderStatusForTesting(1001, status, status === 'RETURNED' ? new Date().toISOString() : null);
      await expect(orderActions.requestReturn(DELIVERED_ORDER_ID)).rejects.toMatchObject({ status: 409 });
    },
  );

  it('404s requesting a return for an order that does not exist / is not the Customer’s own', async () => {
    await expect(orderActions.requestReturn('999999')).rejects.toMatchObject({ status: 404 });
  });

  it('rejects for a signed-out request', async () => {
    resetAuthRuntime();
    await expect(orderActions.requestReturn(DELIVERED_ORDER_ID)).rejects.toBeInstanceOf(ApiError);
  });
});
