import { server } from '@repo/api-sdk/testing/msw-server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { I18nextProvider } from 'react-i18next';

import { ProductsSummary } from '@/features/dashboard/ProductsSummary';
import i18n from '@/i18n';

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
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ProductsSummary />
      </QueryClientProvider>
    </I18nextProvider>,
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
