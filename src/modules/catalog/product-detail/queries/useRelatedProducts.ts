'use client';

import { skipToken, useQuery } from '@tanstack/react-query';

import { getProducts } from '@/integrations/backend/endpoints/catalog';
import type { ProductSummary } from '@/integrations/backend/models/catalog';
import { catalogKeys } from '@/modules/catalog/queries/catalogKeys';
import { buildRelatedQuery, selectRelated } from '@/modules/catalog/queries/catalogQuery';

/**
 * Other Products in the same Category, newest first, excluding the current one. Without a Category the
 * query is built from nothing and is parked on `skipToken` under a separate key, so no fake `''`
 * Category key can ever be fetched or cached.
 */
export function useRelatedProducts(categoryId: string | undefined, excludeSlug: string): { related: ProductSummary[]; isLoading: boolean } {
  const query = categoryId === undefined ? undefined : buildRelatedQuery(categoryId);
  const { data, isLoading } = useQuery({
    queryKey: query === undefined ? ([...catalogKeys.all, 'related', 'none'] as const) : catalogKeys.products(query),
    queryFn: query === undefined ? skipToken : async () => getProducts(query),
  });

  return { related: selectRelated(data, excludeSlug), isLoading };
}
