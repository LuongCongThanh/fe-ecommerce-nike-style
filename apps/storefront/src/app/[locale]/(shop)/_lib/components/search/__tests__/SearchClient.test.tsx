import { server } from '@repo/api-sdk/testing/msw-server';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { NextIntlClientProvider } from 'next-intl';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/render';
import { SearchClient } from '@/app/[locale]/(shop)/_lib/components/search/SearchClient';

let currentSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => currentSearchParams,
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// `CatalogProductGrid` (rendered by `SearchClient` on results) reads `useLocale()`, hence the provider.
function renderSearchClient() {
  return renderWithProviders(
    <NextIntlClientProvider locale="vi" messages={{}}>
      <SearchClient />
    </NextIntlClientProvider>,
  );
}

describe('SearchClient (FE-INT-006)', () => {
  it('renders matching products for a query term', async () => {
    currentSearchParams = new URLSearchParams('q=Running Shoe');
    renderSearchClient();

    await waitFor(() => {
      expect(screen.getByText('Running Shoe Alpha')).toBeInTheDocument();
    });
  });

  it('matches a query missing Vietnamese diacritics against the accented description (issue #11 mock behavior)', async () => {
    currentSearchParams = new URLSearchParams('q=giay chay bo');
    renderSearchClient();

    await waitFor(() => {
      expect(screen.getByText('Running Shoe Alpha')).toBeInTheDocument();
    });
  });

  it('shows an empty state for a query with no matches', async () => {
    currentSearchParams = new URLSearchParams('q=zzzznotarealproductzzzz');
    renderSearchClient();

    await waitFor(() => {
      expect(screen.getByText('Không tìm thấy kết quả nào cho "zzzznotarealproductzzzz"')).toBeInTheDocument();
    });
  });

  it('shows an error state when the request fails', async () => {
    server.use(http.get('*/api/catalog/products', () => HttpResponse.json({ message: 'boom' }, { status: 500 })));
    currentSearchParams = new URLSearchParams('q=Running Shoe');

    renderSearchClient();

    await waitFor(() => {
      expect(screen.getByText('Không thể tìm kiếm sản phẩm')).toBeInTheDocument();
    });
  });
});
