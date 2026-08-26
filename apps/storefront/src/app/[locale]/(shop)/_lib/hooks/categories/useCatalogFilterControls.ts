'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import type { SyntheticEvent } from 'react';

import { clearCatalogFilters, parseCatalogFilters, withCatalogFilter } from '@/app/[locale]/(shop)/_lib/utils/catalogUrlState';

/** Owns `FilterSidebar`'s URL-state — reading the current filters and writing every change (gender,
 * sort, price range, clear-all) back via `router.push` inside a transition, so the sidebar only wires
 * up form controls to what this hook returns. */
export function useCatalogFilterControls() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const filters = parseCatalogFilters(searchParams);

  function applyFilter(key: 'gender' | 'sortBy' | 'minPrice' | 'maxPrice', value: string | undefined): void {
    startTransition(() => {
      router.push(`?${withCatalogFilter(searchParams, key, value).toString()}`);
    });
  }

  function submitPriceRange(e: SyntheticEvent<HTMLFormElement>): void {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const next = withCatalogFilter(
      withCatalogFilter(searchParams, 'minPrice', formData.get('minPrice') as string),
      'maxPrice',
      formData.get('maxPrice') as string,
    );
    startTransition(() => {
      router.push(`?${next.toString()}`);
    });
  }

  function clearFilters(): void {
    startTransition(() => {
      router.push(`?${clearCatalogFilters(searchParams).toString()}`);
    });
  }

  return { filters, applyFilter, submitPriceRange, clearFilters, isPending };
}
