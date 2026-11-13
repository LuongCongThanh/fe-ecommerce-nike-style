'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { parseCatalogFilters, parseCatalogOptionFilters, withCatalogPage } from '@/features/catalog/catalogUrlState';
import { useProducts } from '@/features/catalog/queries/useProducts';

/**
 * PLP/Category listing: parses filters out of the URL, fetches the page, and exposes `onPageChange` as
 * the one place pagination writes back to the URL. `CategoryClient` (fixed `categorySlug`) and
 * `ProductsClient` (`categorySlug` read from `?category=`) both render the same data through this.
 */
export function useCatalogListing(categorySlugOverride?: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = categorySlugOverride ?? searchParams.get('category') ?? undefined;
  const filters = parseCatalogFilters(searchParams);
  const options = parseCatalogOptionFilters(searchParams);

  const query = useProducts(categorySlug, filters, options);

  function onPageChange(page: number): void {
    router.push(`?${withCatalogPage(searchParams, page).toString()}`);
  }

  return { ...query, categorySlug, filters, onPageChange };
}
