import type { DataTablePagination } from '@/shell/DataTable';
import { useUrlPage } from '@/shell/useUrlPage';

export interface ClientDataTablePaginationResult<T> {
  readonly pageItems: T[];
  readonly pagination: DataTablePagination;
}

export interface ClientDataTablePaginationLabels {
  readonly pageOf: (page: number, totalPages: number) => string;
  readonly previous: string;
  readonly next: string;
}

/**
 * Client-side "fetch everything, slice one page" pagination shared by every list page that has no
 * server-side pagination (categories/inventory/orders/staff). Centralizes the `page/totalPages/slice/
 * onPrevious/onNext` shape that used to be reimplemented per page and reads page state from the URL
 * via `useUrlPage`, not local `useState`.
 */
export function useClientDataTablePagination<T>(
  items: readonly T[],
  pageSize: number,
  labels: ClientDataTablePaginationLabels,
): ClientDataTablePaginationResult<T> {
  const { page: rawPage, setPage } = useUrlPage();
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(rawPage, totalPages);
  const pageItems = items.slice((page - 1) * pageSize, page * pageSize);

  return {
    pageItems,
    pagination: {
      page,
      totalPages,
      onPrevious: () => {
        setPage(page - 1);
      },
      onNext: () => {
        setPage(page + 1);
      },
      onPageChange: setPage,
      label: labels.pageOf(page, totalPages),
      previousLabel: labels.previous,
      nextLabel: labels.next,
    },
  };
}
