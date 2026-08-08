import { registerAuthRuntimeAdapter } from '@repo/api-sdk/client/runtime';
import { encodeAccessToken } from '@repo/api-sdk/mocks/auth-fixtures';
import { server } from '@repo/api-sdk/testing/msw-server';
import { screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/render';
import { OrdersClient } from '@/app/[locale]/(shop)/_lib/components/orders/OrdersClient';

const ACCOUNT_USER_ID = 1;

let unregister: (() => void) | undefined;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  unregister?.();
});
afterAll(() => server.close());

function renderOrdersClient() {
  return renderWithProviders(
    <NextIntlClientProvider locale="vi" messages={{}}>
      <OrdersClient />
    </NextIntlClientProvider>,
  );
}

describe('OrdersClient — fetches client-side (issue #16, closing the #15 SSR-auth gap)', () => {
  it('shows the signed-in Customer’s own order history', async () => {
    unregister = registerAuthRuntimeAdapter({
      getAccessToken: () => encodeAccessToken({ sub: ACCOUNT_USER_ID, exp: Date.now() + 60_000 }),
      refreshSession: () => Promise.reject(new Error('not used in this test')),
    });

    renderOrdersClient();
    expect(await screen.findByText('Đơn #DH1001')).toBeInTheDocument();
    expect(screen.getByText('Đơn #DH1002')).toBeInTheDocument();
  });

  it('shows an error state instead of a silent empty list when signed out', async () => {
    renderOrdersClient();
    expect(await screen.findByText('Đã có lỗi xảy ra khi tải đơn hàng. Vui lòng thử lại.')).toBeInTheDocument();
  });
});
