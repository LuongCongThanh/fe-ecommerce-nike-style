import { server } from '@repo/api-sdk/testing/msw-server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import commonMessages from '@/lang/vi/common.json';

import { ProductsSummary } from '@/features/dashboard/ProductsSummary';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

function renderWithQueryClient() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <NextIntlClientProvider locale="vi" messages={{ common: commonMessages }}>
      <QueryClientProvider client={queryClient}>
        <ProductsSummary />
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe('ProductsSummary', () => {
  it('renders the @repo/ui Button primitive and the mocked product list', async () => {
    renderWithQueryClient();

    expect(screen.getByRole('button', { name: 'Tải lại' })).toBeInTheDocument();
    expect(await screen.findByText('Cap Trucker Unisex')).toBeInTheDocument();
    expect(screen.getByText('Basketball High-Top Court')).toBeInTheDocument();
  });
});
