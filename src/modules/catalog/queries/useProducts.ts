'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getProducts } from '@/integrations/backend/endpoints/catalog';
import type { CatalogFilters, CatalogOptionFilters } from '@/modules/catalog/catalogUrlState';
import { catalogKeys } from '@/modules/catalog/queries/catalogKeys';
import { buildProductListQuery, NO_OPTION_FILTERS, resolveCategoryId } from '@/modules/catalog/queries/catalogQuery';
import { useCategoryTree } from '@/modules/catalog/queries/useCategoryTree';

/**
 * PLP/Category product list from the API. A category slug resolves to its id through the Category
 * tree; the API includes the Category's descendants (BR-CAT-15). An unknown slug fetches nothing.
 */
export function useProducts(categorySlug: string | undefined, filters: CatalogFilters, options: CatalogOptionFilters = NO_OPTION_FILTERS) {
  const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = useCategoryTree();
  const categoryId = categorySlug === undefined ? undefined : resolveCategoryId(categories, categorySlug);
  const isCategoryResolved = categorySlug === undefined || categoryId !== undefined;

  const query = buildProductListQuery(categoryId, filters, options);

  const result = useQuery({
    queryKey: catalogKeys.products(query),
    enabled: isCategoryResolved,
    // Paging or changing a filter keeps the current grid on screen while the next one loads, instead
    // of collapsing to a spinner and back. Callers surface the in-between state via `isPlaceholderData`.
    placeholderData: keepPreviousData,
    queryFn: async () => getProducts(query),
  });

  // Without the tree a category slug cannot resolve; report that instead of an empty grid.
  const error = categorySlug !== undefined && categoriesError !== null ? categoriesError : result.error;
  return {
    ...result,
    error,
    isError: error !== null,
    isLoading: result.isLoading || (categorySlug !== undefined && isCategoriesLoading),
  };
}
