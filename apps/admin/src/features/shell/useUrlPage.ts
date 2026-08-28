import { useNavigate, useSearch } from '@tanstack/react-router';

export interface UrlPageResult {
  readonly page: number;
  readonly setPage: (page: number) => void;
}

/**
 * Keeps the current list-page's page number in the `?page=` URL search param instead of local React
 * state (docs/FRONTEND-GUIDE.md §8: "filter/sort/pagination → URL/search params") — refresh, share, and
 * browser back/forward now preserve the page a staff member was on. Uses TanStack Router's typed
 * search-param API instead of Next.js's `next/navigation` (`strict: false` — this hook is called from
 * several different routes, none of which declare a `page` search param via `validateSearch`).
 */
export function useUrlPage(): UrlPageResult {
  const navigate = useNavigate();
  const search: { page?: string } = useSearch({ strict: false });

  const rawPage = Number(search.page);
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  function setPage(nextPage: number): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic across routes, none of which declare a `page` search param via `validateSearch`, same reason `strict: false` is used above.
    (navigate as (opts: any) => void)({
      to: '.',
      search: (prev: Record<string, unknown>) => ({ ...prev, page: nextPage <= 1 ? undefined : nextPage }),
    });
  }

  return { page, setPage };
}
