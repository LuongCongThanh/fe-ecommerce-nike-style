'use client';

import { getCategories } from '@repo/api-sdk/endpoints/catalog';
import { useQuery } from '@tanstack/react-query';

import { catalogKeys } from '@/app/[locale]/(shop)/_lib/hooks/products/catalogKeys';
import { ensureApiMockingReady } from '@/shared/lib/api-mocking';

/** Full flat Category tree (Decision #50) — the Shoes/Apparel/Accessories x 2 children mock, backed by `packages/api-sdk`. */
export function useCategoryTree() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: async () => {
      await ensureApiMockingReady();
      const { data } = await getCategories();
      return data;
    },
    staleTime: 10 * 60_000,
  });
}
