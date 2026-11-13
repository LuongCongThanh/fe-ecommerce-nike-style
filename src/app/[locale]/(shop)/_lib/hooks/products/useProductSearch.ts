'use client';

import { useQuery } from '@tanstack/react-query';

import { catalogKeys } from '@/app/[locale]/(shop)/_lib/hooks/products/catalogKeys';
import { getProducts } from '@/lib/api/endpoints/catalog';

const PAGE_SIZE = 12;

/**
 * Search results — the same list call PLP uses, scoped to `q` only. Deliberately has no category,
 * gender, sort or price state so Search never reads or writes the PLP filter URL-state (issue #11).
 * Keying by `(query, page)` means a slow, older request can never overwrite a newer one's result.
 */
export function useProductSearch(query: string, page: number) {
  const q = query.trim();
  return useQuery({
    queryKey: catalogKeys.search(q, page),
    enabled: q.length > 0,
    queryFn: async () => getProducts({ page, limit: PAGE_SIZE, sort: 'newest', q }),
  });
}
