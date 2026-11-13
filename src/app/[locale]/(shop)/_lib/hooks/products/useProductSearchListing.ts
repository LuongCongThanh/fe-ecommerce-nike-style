'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { useProductSearch } from '@/app/[locale]/(shop)/_lib/hooks/products/useProductSearch';

/** Search results page: reads `q`/`page` from the URL and exposes `onPageChange` as the one place
 * pagination writes back to it. Deliberately separate from `useCatalogListing` — Search never reads or
 * writes the PLP/Category filter URL-state (issue #11), so it gets its own thin URL-state wrapper. */
export function useProductSearchListing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const pageParam = searchParams.get('page');
  const page = pageParam !== null ? Math.max(1, Number(pageParam)) : 1;

  const result = useProductSearch(query, page);

  function onPageChange(nextPage: number): void {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', nextPage.toString());
    router.push(`?${params.toString()}`);
  }

  return { ...result, query, onPageChange };
}
