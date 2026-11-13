import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/lib/api/testing/msw-server';

import { renderWithProviders } from '@/helpers/render';
import { SearchClient } from '@/app/[locale]/(shop)/search/components/SearchClient';

let currentSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => currentSearchParams,
}));

// API-shaped list response (`GET /api/v1/products`): one match for "Running Shoe", nothing otherwise.
const runningShoe = {
  id: 'p-1',
  categoryId: 'c-1',
  name: 'Running Shoe Alpha',
  slug: 'running-shoe-alpha',
  description: null,
  weightGrams: 500,
  gender: 'UNISEX',
  status: 'ACTIVE',
  publishedAt: '2026-11-01T00:00:00.000Z',
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
  minPrice: 1_200_000,
  maxPrice: 1_200_000,
  imageUrl: null,
};
const productsHandler = http.get('*/api/v1/products', ({ request }) => {
  const q = new URL(request.url).searchParams.get('q') ?? '';
  const data = q === 'Running Shoe' ? [runningShoe] : [];
  return HttpResponse.json({ data, meta: { page: 1, limit: 12, total: data.length, totalPages: data.length > 0 ? 1 : 0 } });
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => server.use(productsHandler));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// `renderWithProviders` already wraps with a real-messages `NextIntlClientProvider` — needed since
// SearchClient reads `useTranslations()` and `CatalogProductGrid` reads `useLocale()`.
function renderSearchClient() {
  return renderWithProviders(<SearchClient />);
}

describe('SearchClient (FE-INT-006)', () => {
  it('renders matching products for a query term', async () => {
    currentSearchParams = new URLSearchParams('q=Running Shoe');
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
    server.use(http.get('*/api/v1/products', () => HttpResponse.json({ message: 'boom' }, { status: 500 })));
    currentSearchParams = new URLSearchParams('q=Running Shoe');

    renderSearchClient();

    await waitFor(() => {
      expect(screen.getByText('Không thể tải sản phẩm')).toBeInTheDocument();
    });
  });
});
