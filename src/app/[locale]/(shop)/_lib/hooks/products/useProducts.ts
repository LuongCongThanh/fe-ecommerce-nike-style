'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { useCategoryTree } from '@/app/[locale]/(shop)/_lib/hooks/categories/useCategoryTree';
import { catalogKeys } from '@/app/[locale]/(shop)/_lib/hooks/products/catalogKeys';
import type { CatalogFilters, CatalogOptionFilters } from '@/app/[locale]/(shop)/_lib/utils/catalogUrlState';
import { toApiGender } from '@/app/[locale]/(shop)/_lib/utils/catalogUrlState';
import { getProducts } from '@/lib/api/endpoints/catalog';
import type { ProductQuery } from '@/lib/api/models/catalog';

const PAGE_SIZE = 12;
const NO_OPTIONS: CatalogOptionFilters = { size: [], color: [] };

/**
 * PLP/Category product list from the API. A category slug resolves to its id through the Category
 * tree; the API includes the Category's descendants (BR-CAT-15). An unknown slug fetches nothing.
 */
export function useProducts(categorySlug: string | undefined, filters: CatalogFilters, options: CatalogOptionFilters = NO_OPTIONS) {
  const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = useCategoryTree();
  const categoryId = categorySlug === undefined ? undefined : categories?.flat.find((c) => c.slug === categorySlug)?.id;
  const isCategoryResolved = categorySlug === undefined || categoryId !== undefined;

  const query: ProductQuery = {
    page: filters.page,
    limit: PAGE_SIZE,
    sort: filters.sortBy,
    categoryId,
    gender: filters.gender === undefined ? undefined : [toApiGender(filters.gender)],
    size: options.size,
    color: options.color,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  };

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
