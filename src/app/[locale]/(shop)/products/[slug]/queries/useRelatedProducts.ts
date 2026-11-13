'use client';

import { useQuery } from '@tanstack/react-query';

import { catalogKeys } from '@/features/catalog/queries/catalogKeys';
import { getProducts } from '@/lib/api/endpoints/catalog';
import type { ProductQuery, ProductSummary } from '@/lib/api/models/catalog';

const RELATED_LIMIT = 4;

/** Other Products in the same Category, newest first, excluding the current one. */
export function useRelatedProducts(categoryId: string | undefined, excludeSlug: string): { related: ProductSummary[]; isLoading: boolean } {
  const query: ProductQuery = { categoryId, limit: RELATED_LIMIT + 1, sort: 'newest' };
  const { data, isLoading } = useQuery({
    queryKey: catalogKeys.products(query),
    enabled: categoryId !== undefined,
    queryFn: async () => getProducts(query),
  });

  const related = (data?.data ?? []).filter((p) => p.slug !== excludeSlug).slice(0, RELATED_LIMIT);
  return { related, isLoading };
}
