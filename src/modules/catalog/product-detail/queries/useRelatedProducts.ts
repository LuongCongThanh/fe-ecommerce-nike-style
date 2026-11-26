'use client';

import { useQuery } from '@tanstack/react-query';

import { getProducts } from '@/integrations/backend/endpoints/catalog';
import type { ProductSummary } from '@/integrations/backend/models/catalog';
import { catalogKeys } from '@/modules/catalog/queries/catalogKeys';
import { buildRelatedQuery, selectRelated } from '@/modules/catalog/queries/catalogQuery';

/** Other Products in the same Category, newest first, excluding the current one. */
export function useRelatedProducts(categoryId: string | undefined, excludeSlug: string): { related: ProductSummary[]; isLoading: boolean } {
  const query = buildRelatedQuery(categoryId ?? '');
  const { data, isLoading } = useQuery({
    queryKey: catalogKeys.products(query),
    enabled: categoryId !== undefined,
    queryFn: async () => getProducts(buildRelatedQuery(categoryId ?? '')),
  });

  return { related: selectRelated(data, excludeSlug), isLoading };
}
