import type { CategoryNode, ProductQuery } from '@/integrations/backend/models/catalog';
import type { CatalogFilters, CatalogOptionFilters } from '@/modules/catalog/catalogUrlState';
import { toApiGender } from '@/modules/catalog/catalogUrlState';
import { flattenCategories } from '@/modules/catalog/categoryTree';

/**
 * Query policy shared by the browser hooks and the server prefetch, so both write the same key with
 * the same shape. Pure: no React, no browser store, no transport.
 */

/** PLP/Category page size (the URL has no `limit`). */
export const CATALOG_PAGE_SIZE = 12;

/** Categories, sizes and colors change rarely; keep them fresh for 10 minutes (default is 60 s). */
export const CATALOG_REFERENCE_STALE_TIME = 10 * 60_000;

export const NO_OPTION_FILTERS: CatalogOptionFilters = { size: [], color: [] };

/** The data shape under `catalogKeys.categories()`: the tree plus a flat list for slug lookups. */
export function toCategoryData(tree: readonly CategoryNode[]) {
  return { tree, flat: flattenCategories(tree) };
}

export type CategoryData = ReturnType<typeof toCategoryData>;

/** Resolves a category slug to its id; `undefined` when the slug is not in the tree. */
export function resolveCategoryId(categories: CategoryData | undefined, slug: string): string | undefined {
  return categories?.flat.find((category) => category.slug === slug)?.id;
}

/** URL filters -> the `ProductQuery` that keys and fetches the PLP/Category list. */
export function buildProductListQuery(
  categoryId: string | undefined,
  filters: CatalogFilters,
  options: CatalogOptionFilters = NO_OPTION_FILTERS,
): ProductQuery {
  return {
    page: filters.page,
    limit: CATALOG_PAGE_SIZE,
    sort: filters.sortBy,
    categoryId,
    gender: filters.gender === undefined ? undefined : [toApiGender(filters.gender)],
    size: options.size,
    color: options.color,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  };
}

/** Search is the same list call scoped to `q` only (no category, gender, price or PLP options). */
export function buildSearchQuery(q: string, page: number): ProductQuery {
  return { page, limit: CATALOG_PAGE_SIZE, sort: 'newest', q };
}
