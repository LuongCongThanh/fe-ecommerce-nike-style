'use client';

import { useQuery } from '@tanstack/react-query';

import { getCategoryTree } from '@/lib/api/endpoints/catalog';
import { flattenCategories } from '@/modules/catalog/categoryTree';
import { catalogKeys } from '@/modules/catalog/queries/catalogKeys';

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
