'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export interface UrlPageResult {
  readonly page: number;
  readonly setPage: (page: number) => void;
}

/**
 * Keeps the current list-page's page number in the `?page=` URL search param instead of local React
 * state (docs/FRONTEND-GUIDE.md §8: "filter/sort/pagination → URL/search params") — refresh, share, and
 * browser back/forward now preserve the page a staff member was on. Mirrors storefront's
 * `useCatalogListing`/`withCatalogPage` URL-state pattern (code review on PR #73).
 */
export function useUrlPage(): UrlPageResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawPage = Number(searchParams.get('page'));
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  function setPage(nextPage: number): void {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(nextPage));
    }
    const query = params.toString();
    router.push(query === '' ? pathname : `${pathname}?${query}`);
  }

  return { page, setPage };
}
