'use client';

import { getProducts } from '@repo/api-sdk/endpoints/catalog';
import { useQuery } from '@tanstack/react-query';

import { catalogKeys } from '@/app/[locale]/(shop)/_lib/hooks/products/catalogKeys';
import { ensureApiMockingReady } from '@/shared/lib/api-mocking';

const PAGE_SIZE = 12;

/**
 * Search results — same `packages/api-sdk` catalog list call PLP uses (`useProducts`), scoped to
 * `search` only. Deliberately has no `category`/`gender`/`sortBy`/`minPrice`/`maxPrice` state so
 * Search never reads or writes the PLP/Category filter URL-state (issue #11 — "state riêng, không
 * đụng URL-state của catalog filter"). Keying the query by `(query, page)` also means an old, slow
 * request can never overwrite a newer one's rendered result — each distinct search term/page gets its
 * own cache entry, so there's no shared mutable "last response" for a stale request to clobber.
 */
export function useProductSearch(query: string, page: number) {
  return useQuery({
    queryKey: catalogKeys.search(query, page),
    enabled: query.trim().length > 0,
    queryFn: async () => {
      await ensureApiMockingReady();
      return getProducts({ page, pageSize: PAGE_SIZE, sort: 'newest', search: query });
    },
  });
}
