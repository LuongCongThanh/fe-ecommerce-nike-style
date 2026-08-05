'use client';

import { getProducts } from '@repo/api-sdk/endpoints/catalog';
import { useQuery } from '@tanstack/react-query';

import { catalogKeys } from '@/app/[locale]/(shop)/_lib/hooks/products/catalogKeys';
import type { CatalogFilters } from '@/app/[locale]/(shop)/_lib/utils/catalogUrlState';
import { ensureApiMockingReady } from '@/shared/lib/api-mocking';

const PAGE_SIZE = 12;

/** PLP/Category product list — backed by `packages/api-sdk` (MSW mock today, real Backend later behind the same call shape per Decision #28). */
export function useProducts(categorySlug: string | undefined, filters: CatalogFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: catalogKeys.products(categorySlug, filters),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      await ensureApiMockingReady();
      return getProducts({
        page: filters.page,
        pageSize: PAGE_SIZE,
        sort: filters.sortBy,
        category: categorySlug,
        gender: filters.gender,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      });
    },
  });
}
