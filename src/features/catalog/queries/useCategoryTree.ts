'use client';

import { useQuery } from '@tanstack/react-query';

import { flattenCategories } from '@/features/catalog/categoryTree';
import { catalogKeys } from '@/features/catalog/queries/catalogKeys';
import { getCategoryTree } from '@/lib/api/endpoints/catalog';

/** The visible Category tree from the API, plus a flat list for slug lookups and breadcrumbs. */
export function useCategoryTree() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: async () => {
      const tree = await getCategoryTree();
      return { tree, flat: flattenCategories(tree) };
    },
    staleTime: 10 * 60_000,
  });
}
