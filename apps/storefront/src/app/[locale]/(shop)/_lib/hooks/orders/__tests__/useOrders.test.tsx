import { resetAuthRuntime } from '@repo/api-sdk/client';
import { registerAuthRuntimeAdapter } from '@repo/api-sdk/client/runtime';
import { encodeAccessToken } from '@repo/api-sdk/mocks/auth-fixtures';
import { server } from '@repo/api-sdk/testing/msw-server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { useOrder } from '@/app/[locale]/(shop)/_lib/hooks/orders/useOrder';
import { useOrders } from '@/app/[locale]/(shop)/_lib/hooks/orders/useOrders';
import { ApiError } from '@/shared/lib/errors/api-error';

// Demo account (user id 1) seeded in `packages/api-sdk/src/mocks/order-fixtures.ts` with orders 1001/1002.
const ACCOUNT_USER_ID = 1;
const OWN_ORDER_ID = '1001';
const OTHER_USERS_ORDER_ID = '9999'; // doesn't exist in the mock DB at all — same shape as "not mine"

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetAuthRuntime();
});
afterAll(() => server.close());

function renderWithClient<T>(hook: () => T) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return renderHook(hook, { wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider> });
}

function loginAsDemoAccount() {
  registerAuthRuntimeAdapter({
    getAccessToken: () => encodeAccessToken({ sub: ACCOUNT_USER_ID, exp: Date.now() + 60_000 }),
    refreshSession: () => Promise.reject(new Error('not used in this test')),
  });
}

describe('Order history — ownership (FE-INT, issue #15)', () => {
  it('lists only the signed-in Customer’s own orders', async () => {
    loginAsDemoAccount();
    const { result } = renderWithClient(() => useOrders());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.every((o) => [1001, 1002].includes(o.id))).toBe(true);
  });

  it('resolves the detail of an order the Customer owns', async () => {
    loginAsDemoAccount();
    const { result } = renderWithClient(() => useOrder(OWN_ORDER_ID));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.code).toBe('DH1001');
  });

  it('404s (not a data leak) for an order id that is not the Customer’s own', async () => {
    loginAsDemoAccount();
    const { result } = renderWithClient(() => useOrder(OTHER_USERS_ORDER_ID));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect((result.current.error as ApiError).isNotFound).toBe(true);
  });

  it('rejects order history for a signed-out request', async () => {
    const { result } = renderWithClient(() => useOrders());

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
