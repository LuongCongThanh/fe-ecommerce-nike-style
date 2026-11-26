import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createReservation } from '@/integrations/backend/endpoints/checkout';
import { resetAuthRuntime } from '@/integrations/backend/client/fetcher';
import { registerAuthRuntimeAdapter } from '@/integrations/backend/client/runtime';
import { encodeAccessToken } from '@/integrations/backend/mocks/auth-fixtures';
import { resetMockCatalogStockForTesting } from '@/integrations/backend/mocks/catalog-fixtures';
import { resetMockOrderDbForTesting } from '@/integrations/backend/mocks/order-fixtures';
import { resetMockReservationsForTesting } from '@/integrations/backend/mocks/reservation-fixtures';
import { server } from '@/integrations/backend/testing/msw-server';

import { readCartItemsForTest, resetCartForTest } from '@/modules/cart/testing/cart.fixture';
import { useCart } from '@/modules/cart/hooks/useCart';
import type { CheckoutInput } from '@/modules/checkout/schemas/checkout.schema';
import { useCreateOrder } from '@/modules/checkout/queries/useCreateOrder';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const SKU = 'p-1-0-0';
const ACCOUNT_USER_ID = 1;
const ADDRESS = {
  fullName: 'Nguyễn Văn A',
  phoneNumber: '0912345678',
  address: '123 ABC',
  city: 'Hà Nội',
  district: 'Q1',
  ward: 'P1',
  shippingMethod: 'standard',
  paymentMethod: 'cod',
} satisfies CheckoutInput;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetAuthRuntime();
});
afterAll(() => server.close());

beforeEach(() => {
  resetCartForTest();
  resetMockReservationsForTesting();
  resetMockOrderDbForTesting();
  resetMockCatalogStockForTesting();
  registerAuthRuntimeAdapter({
    getAccessToken: () => encodeAccessToken({ sub: ACCOUNT_USER_ID, exp: Date.now() + 60_000 }),
    refreshSession: () => Promise.reject(new Error('not used in this test')),
  });
});

function renderCreateOrder(reservationId: string | null) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } });
  return renderHook(
    () => {
      const cart = useCart();
      const createOrder = useCreateOrder('vi', reservationId);
      return { cart, createOrder };
    },
    { wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider> },
  );
}

describe('useCreateOrder (checkout, issue #16)', () => {
  it('rejects without a reservation and leaves the cart untouched', async () => {
    const { result } = renderCreateOrder(null);
    act(() => {
      result.current.cart.addToCart(SKU, 1, 14);
    });

    act(() => {
      result.current.createOrder.mutate(ADDRESS);
    });

    await waitFor(() => expect(result.current.createOrder.isError).toBe(true));
    expect(readCartItemsForTest()).toHaveLength(1);
    expect(push).not.toHaveBeenCalled();
  });

  it('clears the cart through useCart and redirects to the success page once the order is placed', async () => {
    const reservation = await createReservation([{ skuId: SKU, quantity: 1 }]);
    const { result } = renderCreateOrder(reservation.reservationId);
    act(() => {
      result.current.cart.addToCart(SKU, 1, 14);
    });
    await waitFor(() => expect(result.current.cart.items).toHaveLength(1));

    act(() => {
      result.current.createOrder.mutate(ADDRESS);
    });

    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    expect(push.mock.calls[0]?.[0]).toMatch(/^\/vi\/checkout\/success\?orderId=\d+$/);
    expect(readCartItemsForTest()).toHaveLength(0);
  });
});
