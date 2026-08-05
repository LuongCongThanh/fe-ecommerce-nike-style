import type { Gender } from '@repo/schemas/catalog';

/** Matches the sort options `FilterSidebar` renders and `packages/api-sdk` `getProducts` accepts. */
export type CatalogSort = 'newest' | 'price_asc' | 'price_desc';

export interface CatalogFilters {
  readonly gender?: Gender;
  readonly sortBy: CatalogSort;
  readonly page: number;
  readonly minPrice?: number;
  readonly maxPrice?: number;
}

const VALID_GENDERS: readonly Gender[] = ['men', 'women', 'kids', 'unisex'];
const VALID_SORTS: readonly CatalogSort[] = ['newest', 'price_asc', 'price_desc'];

function parsePositiveNumber(value: string | null): number | undefined {
  if (value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/**
 * Pure parse of PLP/Category query-string filters (FE-UNIT-001) — normal input round-trips, malformed
 * input (unknown gender/sort, non-numeric or negative page/price) falls back to a safe default instead
 * of throwing, so a hand-edited or stale shared link never crashes the page.
 */
export function parseCatalogFilters(searchParams: URLSearchParams): CatalogFilters {
  const genderParam = searchParams.get('gender');
  const gender = VALID_GENDERS.includes(genderParam as Gender) ? (genderParam as Gender) : undefined;

  const sortParam = searchParams.get('sortBy');
  const sortBy = VALID_SORTS.includes(sortParam as CatalogSort) ? (sortParam as CatalogSort) : 'newest';

  const pageParam = Number(searchParams.get('page'));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  return {
    gender,
    sortBy,
    page,
    minPrice: parsePositiveNumber(searchParams.get('minPrice')),
    maxPrice: parsePositiveNumber(searchParams.get('maxPrice')),
  };
}

/** Sets/clears one filter key and resets pagination to page 1 — any filter change invalidates the current page. */
export function withCatalogFilter(
  searchParams: URLSearchParams,
  key: 'gender' | 'sortBy' | 'minPrice' | 'maxPrice',
  value: string | undefined,
): URLSearchParams {
  const next = new URLSearchParams(searchParams.toString());
  if (value === undefined || value === '') {
    next.delete(key);
  } else {
    next.set(key, value);
  }
  next.set('page', '1');
  return next;
}

/** Sets the page — the only mutation that does not reset itself back to page 1. */
export function withCatalogPage(searchParams: URLSearchParams, page: number): URLSearchParams {
  const next = new URLSearchParams(searchParams.toString());
  next.set('page', String(page));
  return next;
}

/** Clears every catalog filter/page key, preserving unrelated query params. */
export function clearCatalogFilters(searchParams: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(searchParams.toString());
  next.delete('gender');
  next.delete('sortBy');
  next.delete('minPrice');
  next.delete('maxPrice');
  next.delete('page');
  return next;
}
