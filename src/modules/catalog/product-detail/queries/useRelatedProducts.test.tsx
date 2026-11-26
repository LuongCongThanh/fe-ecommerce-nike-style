import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getProducts } from '@/integrations/backend/endpoints/catalog';
import { catalogKeys } from '@/modules/catalog/queries/catalogKeys';
import { buildRelatedQuery } from '@/modules/catalog/queries/catalogQuery';
import { useRelatedProducts } from '@/modules/catalog/product-detail/queries/useRelatedProducts';

vi.mock('@/integrations/backend/endpoints/catalog', () => ({ getProducts: vi.fn() }));

const summary = (slug: string) => ({ id: slug, slug, name: slug, gender: 'MEN' as const, imageUrl: null, minPrice: 1, maxPrice: 2 });

let queryClient: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

describe('useRelatedProducts', () => {
  it('fetches the related query under the shared products key and drops the current product', async () => {
    vi.mocked(getProducts).mockResolvedValue({ data: [summary('a'), summary('b')], meta: { page: 1, total: 2, totalPages: 1 } });

    const { result } = renderHook(() => useRelatedProducts('cat-1', 'a'), { wrapper });

    await waitFor(() => expect(result.current.related.map((p) => p.slug)).toEqual(['b']));
    expect(getProducts).toHaveBeenCalledWith(buildRelatedQuery('cat-1'));
    expect(queryClient.getQueryData(catalogKeys.products(buildRelatedQuery('cat-1')))).toBeDefined();
  });

  it('never queries (or caches an empty-category key) without a categoryId', async () => {
    const { result } = renderHook(() => useRelatedProducts(undefined, 'a'), { wrapper });

    expect(result.current.related).toEqual([]);
    expect(getProducts).not.toHaveBeenCalled();
    const keys = queryClient
      .getQueryCache()
      .getAll()
      .map((q) => JSON.stringify(q.queryKey));
    expect(keys.some((key) => key.includes('"categoryId":""'))).toBe(false);
  });
});
