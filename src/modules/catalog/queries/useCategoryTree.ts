'use client';

import { useQuery } from '@tanstack/react-query';

import { getCategoryTree } from '@/integrations/backend/endpoints/catalog';
import { catalogKeys } from '@/modules/catalog/queries/catalogKeys';
import { CATALOG_REFERENCE_STALE_TIME, toCategoryData } from '@/modules/catalog/queries/catalogQuery';

/** The visible Category tree from the API, plus a flat list for slug lookups and breadcrumbs. */
export function useCategoryTree() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: async () => toCategoryData(await getCategoryTree()),
    staleTime: CATALOG_REFERENCE_STALE_TIME,
  });
}
