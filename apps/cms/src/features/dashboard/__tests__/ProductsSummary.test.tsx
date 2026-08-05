import { server } from '@repo/api-sdk/testing/msw-server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

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
    <QueryClientProvider client={queryClient}>
      <ProductsSummary />
    </QueryClientProvider>,
  );
}

describe('ProductsSummary', () => {
  it('renders the @repo/ui Button primitive and the mocked product list', async () => {
    renderWithQueryClient();

    expect(screen.getByRole('button', { name: 'Tải lại' })).toBeInTheDocument();
    expect(await screen.findByText('Air Max 90')).toBeInTheDocument();
    expect(screen.getByText('Air Force 1')).toBeInTheDocument();
  });
});
