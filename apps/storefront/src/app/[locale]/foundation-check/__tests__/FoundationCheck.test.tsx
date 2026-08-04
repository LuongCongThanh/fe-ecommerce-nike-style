import { server } from '@repo/api-sdk/testing/msw-server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { FoundationCheck } from '@/app/[locale]/foundation-check/FoundationCheck';

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
      <FoundationCheck />
    </QueryClientProvider>,
  );
}

describe('FoundationCheck', () => {
  it('renders the @repo/ui Button primitive and the mocked product list', async () => {
    renderWithQueryClient();

    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(await screen.findByText('Air Max 90')).toBeInTheDocument();
    expect(screen.getByText('Air Force 1')).toBeInTheDocument();
  });
});
