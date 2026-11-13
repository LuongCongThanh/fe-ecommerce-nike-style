import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { resetAuthRuntime } from '@/lib/api/client/fetcher';
import { registerAuthRuntimeAdapter } from '@/lib/api/client/runtime';
import { encodeAccessToken } from '@/lib/api/mocks/auth-fixtures';
import { resetMockOrderDbForTesting, setOrderStatusForTesting } from '@/lib/api/mocks/order-fixtures';
import { server } from '@/lib/api/testing/msw-server';

import { renderWithProviders } from '@/helpers/render';
import { OrderDetailClient } from '@/features/orders/order-detail/components/OrderDetailClient';

// Demo account (user id 1), order 1002 is seeded PENDING (order-fixtures.ts).
const ACCOUNT_USER_ID = 1;
const ORDER_ID = '1002';

// `renderWithProviders` already wraps with a real-messages `NextIntlClientProvider` — needed since
// OrderDetailClient reads both `useLocale()` and `useTranslations()`.
function renderOrderDetailClient(id: string) {
  return renderWithProviders(<OrderDetailClient id={id} />);
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
