import { resetAuthRuntime } from '@repo/api-sdk/client';
import { registerAuthRuntimeAdapter } from '@repo/api-sdk/client/runtime';
import { encodeAccessToken } from '@repo/api-sdk/mocks/auth-fixtures';
import { resetMockOrderDbForTesting, setOrderStatusForTesting } from '@repo/api-sdk/mocks/order-fixtures';
import { server } from '@repo/api-sdk/testing/msw-server';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/render';
import { OrderDetailClient } from '@/app/[locale]/(shop)/_lib/components/orders/OrderDetailClient';

// Demo account (user id 1), order 1002 is seeded PENDING (order-fixtures.ts).
const ACCOUNT_USER_ID = 1;
const ORDER_ID = '1002';

// OrderDetailClient reads `useLocale()` (for the "back to orders" link) — same pattern as
// OrdersClient.test.tsx, needs a NextIntlClientProvider in the tree.
function renderOrderDetailClient(id: string) {
  return renderWithProviders(
    <NextIntlClientProvider locale="vi" messages={{}}>
      <OrderDetailClient id={id} />
    </NextIntlClientProvider>,
  );
}

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

describe('OrderDetailClient — customer-visible actions per state (FE-INT, issue #17)', () => {
  it('shows "Huỷ đơn hàng" for a PENDING order and hides "Yêu cầu trả hàng"', async () => {
    renderOrderDetailClient(ORDER_ID);
    expect(await screen.findByRole('button', { name: 'Huỷ đơn hàng' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Yêu cầu trả hàng' })).not.toBeInTheDocument();
  });

  it('actually cancels the order when clicked, then hides the button', async () => {
    renderOrderDetailClient(ORDER_ID);
    fireEvent.click(await screen.findByRole('button', { name: 'Huỷ đơn hàng' }));

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Huỷ đơn hàng' })).not.toBeInTheDocument());
  });

  it('hides both actions for a PACKED order — cannot cancel, not yet DELIVERED', async () => {
    setOrderStatusForTesting(1002, 'PACKED');
    renderOrderDetailClient(ORDER_ID);

    await screen.findByText(/Đơn #DH1002/);
    expect(screen.queryByRole('button', { name: 'Huỷ đơn hàng' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Yêu cầu trả hàng' })).not.toBeInTheDocument();
  });

  it('shows "Yêu cầu trả hàng" for a DELIVERED order within the return window', async () => {
    setOrderStatusForTesting(1002, 'DELIVERED', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    renderOrderDetailClient(ORDER_ID);

    expect(await screen.findByRole('button', { name: 'Yêu cầu trả hàng' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Huỷ đơn hàng' })).not.toBeInTheDocument();
  });

  it('shows the expired message instead of the button once past the 7-day return window', async () => {
    setOrderStatusForTesting(1002, 'DELIVERED', new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString());
    renderOrderDetailClient(ORDER_ID);

    await screen.findByText(/Đơn #DH1002/);
    expect(screen.queryByRole('button', { name: 'Yêu cầu trả hàng' })).not.toBeInTheDocument();
    expect(screen.getByText('Đã quá hạn 7 ngày để yêu cầu trả hàng cho đơn này.')).toBeInTheDocument();
  });
});
