import type { Gender as ApiGender } from '@/lib/api/models/catalog';

/** URL spelling of a Gender (`?gender=men`); `toApiGender` maps it to the API value. */
export type Gender = 'men' | 'women' | 'kids' | 'unisex';

/** Matches the sort options `FilterSidebar` renders and the API's `sort` accepts. */
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
  next.delete('size');
  next.delete('color');
  next.delete('page');
  return next;
}

export function toApiGender(gender: Gender): ApiGender {
  return gender.toUpperCase() as ApiGender;
}

/** Size and color codes picked in the PLP filter, repeated in the URL (`?size=M&size=L&color=WHT`). */
export interface CatalogOptionFilters {
  readonly size: readonly string[];
  readonly color: readonly string[];
}

export type CatalogOptionKey = keyof CatalogOptionFilters;

export function parseCatalogOptionFilters(searchParams: URLSearchParams): CatalogOptionFilters {
  return { size: searchParams.getAll('size'), color: searchParams.getAll('color') };
}

/** Adds or removes one size/color code and resets pagination to page 1. */
export function withToggledCatalogOption(searchParams: URLSearchParams, key: CatalogOptionKey, code: string): URLSearchParams {
  const next = new URLSearchParams(searchParams.toString());
  const current = next.getAll(key);
  next.delete(key);
  for (const value of current.includes(code) ? current.filter((c) => c !== code) : [...current, code]) next.append(key, value);
  next.set('page', '1');
  return next;
}
